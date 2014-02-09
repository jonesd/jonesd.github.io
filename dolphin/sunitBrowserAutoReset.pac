| package |
package := Package name: 'sunitBrowserAutoReset'.
package paxVersion: 0;
	basicComment: ''.

package basicPackageVersion: '0.001'.


package methodNames
	add: #SUnitBrowser -> #createSchematicWiring;
	add: #SUnitBrowser -> #onClassAdded:;
	add: #SUnitBrowser -> #onClassRemoved:;
	add: #SUnitBrowser -> #onMethodAdded:;
	add: #SUnitBrowser -> #onMethodRemoved:;
	add: #SUnitBrowser -> #resetIfTestCaseModified:;
	yourself.

package binaryGlobalNames: (Set new
	yourself).

package globalAliases: (Set new
	yourself).

package allResourceNames: (Set new
	yourself).

package setPrerequisites: (IdentitySet new
	add: '..\..\naive_xanadu\image.dolphin\Camp Smalltalk\SUnit\SUnit';
	add: '..\..\naive_xanadu\image.dolphin\odellsoft\SUnitBrowser\SUnitBrowser';
	yourself).

package!

"Class Definitions"!


"Global Aliases"!


"Loose Methods"!

!SUnitBrowser methodsFor!

createSchematicWiring
	"Create the trigger wiring for the receiver. At this stage the initialization
	is complete and the view is open"

	super createSchematicWiring.

	self testCaseListPresenter
		when: #selectionChanged 
			send: #setModelWithSelectedTestCases
			to: self;
		when: #actionPerformed
			send: #browseHierarchy
			to: self.

	self systemModel
		when: #methodAdded: send: #onMethodAdded:
		to: self;
		when: #methodRemoved: send: #onMethodRemoved:
		to: self;
		when: #classAdded: send: #onClassAdded:
		to: self;
		when: #classRemoved: send: #onClassRemoved:
		to: self


!

onClassAdded: aClass
	self resetIfTestCaseModified: aClass.!

onClassRemoved: aClass
	self resetIfTestCaseModified: aClass!

onMethodAdded: aCompilationResult
	| method |
	method := aCompilationResult method.
	method notNil ifTrue: [self resetIfTestCaseModified: method methodClass].!

onMethodRemoved: aMethod
	self resetIfTestCaseModified: aMethod methodClass.!

resetIfTestCaseModified: aClass
	(aClass inheritsFrom: TestCase) ifTrue: [self reset]! !
!SUnitBrowser categoriesFor: #createSchematicWiring!initializing!public! !
!SUnitBrowser categoriesFor: #onClassAdded:!initializing!private! !
!SUnitBrowser categoriesFor: #onClassRemoved:!initializing!private! !
!SUnitBrowser categoriesFor: #onMethodAdded:!initializing!private! !
!SUnitBrowser categoriesFor: #onMethodRemoved:!initializing!private! !
!SUnitBrowser categoriesFor: #resetIfTestCaseModified:!initializing!private! !

"End of package definition"!

"Source Globals"!

"Classes"!

"Binary Globals"!

"Resources"!

