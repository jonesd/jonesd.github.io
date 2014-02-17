---
layout: post
title:  "Diagnosing Handle Leaks in SWT/RCP Windows Applications"
date:   2006-06-05 11:33:42
categories: swt windows technology diagnosis
---

Things were going along quite well in the project room until our PM, the resident stress tester of the group - he has that delicate 'bam-bam' touch that is so important for exploratory testing, managed to get our SWT/RCP client application to enter a weird mode. New editors wouldn't appear, but you could still move between existing ones. And where had the menus gone? After we found the application log, which we normally get to from the About Box off the Help menu though of course that didn't open anymore, our faces went white when the exception stack slithered onto the screen:

{% highlight java %}
org.eclipse.swt.SWTError: No more handles
	at org.eclipse.swt.SWT.error(SWT.java:2968)
	at org.eclipse.swt.SWT.error(SWT.java:2865)
	at org.eclipse.swt.SWT.error(SWT.java:2836)
	at org.eclipse.swt.widgets.Widget.error(Widget.java:395)
	at org.eclipse.swt.widgets.Control.createHandle(Control.java:482)
	at org.eclipse.swt.widgets.Composite.createHandle(Composite.java:229)
	at org.eclipse.swt.widgets.Combo.createHandle(Combo.java:437)
	at org.eclipse.swt.widgets.Control.createWidget(Control.java:497)
	at ? ad nauseam ?
{% endhighlight %}

This has been the first Windows application for me in while, it's been Java, and often Java websites, for so long that the scars had mostly retreated following my days and nights battling the dark work. Inconsistent control API's, background colours that are ignored, and I'm sure the Rich Text Control was spawned from the bowels of the great old one himself. Let's just say my sanity had taken a hit during those years, but with time, things had stabilized to some degree. 'No more handles' didn't help that one bit though.

## Turtles!

Quite why the ancient history of Windows still seems to have its dank claws on our collective shoulders, I'm not sure. 64k is the magic number, and all must obey, except when 10k would be more offensive, which is most of the time. It's all of course down to those little turtles, on whose backs our colourful application rest, each of those turtles has a convenient appendage onto which we can cling for dear life, let's call it a handle. Now those turtles aren't all the same, as they should be in a reasonable universe, in fact there are three classes; Kernel, GDI and User turtles. The GDI and User turtles both look up to the Kernel turtles, you see the Kernel turtles are special. They can multiply and multiply until the world would seem to be composed entirely of Kernel turtles, now that would appear to be a reasonable thing, for the likes of files, processes, threads, events and such are important, really they are so important one would be upset if we were ever to run out of such turtles. Who would put up with such a thing? But the lowly GDI and User turtles, on whose backs such things as pens, fonts, bitmaps, and windows, cursors, icons, oh and menus rest, don?t have such an prominent place in this world. WIMP was only a passing phrase of course, so why let those upstart GDI and User turtles fill up the world with their brash, fast talking ways, they would just spoil the ambience computer scientists worked so long to set up just right. 10,000 should be enough for each application. Actually, why don't we keep them in an enclosure, it will be easier for them to find their friends - they are only insignificant little turtles after all who would panic in wide open spaces, and if they run out of room before their limit, no problem.

Sybase have a fine summary, regrettably turtle free: [http://www.sybase.com/detail?id=1019174](http://www.sybase.com/detail?id=1019174)

And so we hit the User object handle limit. Now I must admit, we have adopted a very open and welcoming attitude to input controls in our application, the more the better. Of course we help to integrate them all into our SWT editors through the fair minded, and colourful, influence of 'The Accordion', which is quite a nifty set of custom controls to provide order unto the multitudes. It all works quite nicely. Still, on a machine with 2GB of RAM, with a prodigious computational proficiency, being told 'No more handles for you!', is just plain rude.

So how does one go about diagnosing any turtle problems you may be having?

## Tools

I started with two free Windows tools.

### Process Explorer
I was using this as a souped-up replacement for the Windows Task Manager. It provides a tree display of all processes, columns for Kernel/GDI/User handle counts, nice CPU history graph, and in-depth Kernel allocations, if you need them. It also has transparency, for when your 'desktop' illusion crashes on the shores of your 30? monitors, while you still have 30sqft of free desktop space around you.

![Process Explorer](/assets/2006-06-05-diagnosing-handle-leaks-in-swtrcp-windows-applications/pexp.png)

### DPus
[http://ltearno.free.fr/dpus/](http://ltearno.free.fr/dpus/)

This connects to a running process, and can show you a summary of handle totals, API error call counts, and the winning feature for me, a graphical rendering of all the allocated GDI objects.

![DPus](/assets/2006-06-05-diagnosing-handle-leaks-in-swtrcp-windows-applications/resleak.png)

## Investigation

With these tools in place, I took an inventory of the costs for opening/closing editors, adding new sections to our editors, triggering input validations and error cases, hovering over buttons, opening dialogs, etc. This entailed before and after totals for each of the Kernel/GDI/User objects. Watch out for leaks by toggling states, and seeing if totals go up or return back to starting values. Opening an editor, adding things, then closing the editor, and seeing if you returned back to the starting values seems to be the gold test. This can be a little more difficult than you would suspect, at least in the early days while tracking down problems, as there is often dynamic one-off allocation of resources in the application and by RCP, for example toolbar buttons are created/destroyed as different editors get focus. Timing the start of the DPus application at the right time, once most of these system allocations have settled down proved useful.

Beyond our extravagant control policy, we had fallen afoul of some sloppy image management, while sating 'The Accordion'. We use the Eclipse ImageRegistry for most of our image holding, which solves most of the problem, but in a few places we needed to dynamically created image. If you create a new Image, you are responsible for disposing it later on. The old allocate in one place, forget to de-allocate later on some-place else. On the whole we did a reasonable job of this, but of course a few cases slipped by; changing the image of a button but forgetting to dispose of any existing image, and not registering a dispose handler for buttons so their image can be disposed. I put together a couple of helpers for this to at least centralize it, though the bigger issue related to the brittle connection between the allocation, upkeep and eventual de-allocation is left for another day.

{% highlight java %}
/**
 * Register a button which should dispose of its image at the end of the buttons life.
 * Such images should have been explicitly allocated by application code with new
 * Image(...), and should not be held under the sway of the ImageRegistry.
 */
public static void registerForImageDisposal(final Button button) {
	button.addDisposeListener(new DisposeListener() {
		public void widgetDisposed(DisposeEvent e) {
			if (!button.isDisposed()) {
				Image image = button.getImage();
				if (image != null) {
					image.dispose();
					button.setImage(null);
				}
			}
		}
	});
}
/**
 * Set the image for a button, and immediately dispose of any existing image it might have
 * held.
 */
public static void setButtonImageWithImageDisposal(Button button, Image newImage) {
	Image oldImage = button.getImage();
	button.setImage(newImage);
	if (oldImage != null && !oldImage.isDisposed()) {
		oldImage.dispose();
	}
}
{% endhighlight %}

The next step would be to try and include an awareness of the importance of not leaking handles in the tests. We wrap any tests that interact with the database to ensure that the row counts of all tables do not change by the conclusion of the test, from the values theyhad at the beginning. It seems that we should be able to do a similar thing for the handle counts around our SWT/UI Integration tests.

Excuse me now, I must check back into my favourite cell, before the turtles start nipping too hard.

Originally posted on: [i-proving.com](http://i-proving.com/2006/06/05/diagnosing-handle-leaks-in-swtrcp-windows-applications/)
