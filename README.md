jonesd.github.io
================

Public website for https://dgjones.info as hosted on github.

It is a mixture of HTML and also Jeykll generated content.

# Running locally with Jeykll

Run locally with:

    jeykll -w --safe serve

Run locally using docker:

    docker run --rm -v $(pwd):/srv/jekyll -p 127.0.0.1:4000:4000 jekyll/jekyll jekyll s --incremental

