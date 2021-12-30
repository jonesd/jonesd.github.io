| package |
package := Package name: 'SourceDocumenter'.
package paxVersion: 0;
	basicComment: 'An alternative to Dolphins DocumentationManager that supports:
- package level and system level generatio
- greater level of linkage between files
- support for class categories and protocols

See
	SourceDocumenter example1
and
	SourceDocumenter onEntireSystem

Versions:

1.1 - 16 March 2003
-Missing HtmlWriteStream class kindly donated by Diego Coronel.

1.0 - Original release

Freeware by David Jones 2001
https://www.dgjones.info'.


package classNames
	add: #HtmlWriteStream;
	add: #SourceDocumenter;
	add: #SourceDocumenterContext;
	yourself.

package binaryGlobalNames: (Set new
	yourself).

package globalAliases: (Set new
	yourself).

package allResourceNames: (Set new
	yourself).

package setPrerequisites: (IdentitySet new
	add: '..\..\abora\dolphin\image\Object Arts\Dolphin\Base\Dolphin';
	yourself).

package!

"Class Definitions"!

Object subclass: #SourceDocumenter
	instanceVariableNames: ''
	classVariableNames: 'BadFileNameCharacters'
	poolDictionaries: ''
	classInstanceVariableNames: ''!
Object subclass: #SourceDocumenterContext
	instanceVariableNames: 'classes packages outputDirectoryName title showIndexOnCompletion'
	classVariableNames: ''
	poolDictionaries: ''
	classInstanceVariableNames: ''!
FileStream subclass: #HtmlWriteStream
	instanceVariableNames: ''
	classVariableNames: ''
	poolDictionaries: ''
	classInstanceVariableNames: ''!

"Global Aliases"!


"Loose Methods"!

"End of package definition"!

"Source Globals"!

"Classes"!

SourceDocumenter guid: (GUID fromString: '{181EA54F-4E7B-43A7-A4B8-F3484C0F4FC9}')!
SourceDocumenter comment: ''!
!SourceDocumenter categoriesForClass!Unclassified! !
!SourceDocumenter methodsFor!

createAllCategoriesDocument: categories context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: self getFileNameForAllCategories title:  'All Categories' context: context do: [:stream |
		categories asSortedCollection
			do: [:category | self emitReferenceToCategory: category on: stream]
			separatedBy: [stream tag: 'br']].
!

createAllClassesDocument: classes context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: self getFileNameForAllClasses title: 'All Classes' context: context do: [:stream |
		self emitClassesAsTable: classes asSortedCollection on: stream].
!

createAllPackagesDocument: packages context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: self getFileNameForAllPackages title: 'All Packages' context: context do: [:stream |
		self emitPackagesAsTable: packages on: stream].
!

createAllProtocolsDocument: protocols context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: self getFileNameForAllProtocols title:  'All Protocols' context: context do: [:stream |
		protocols asSortedCollection
			do: [:protocol | self emitReferenceToProtocol: protocol on: stream]
			separatedBy: [stream tag: 'br']].
!

createClassCategoryDocument: category context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: (self getFileNameForCategory: category) title: 'Category: ', category name context: context do: [:stream |
		self emitClassesAsTable: category contents asSortedCollection on: stream].!

createClassDocument: aClass context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: (self getFileNameForClass: aClass) title: 'Class: ', aClass name context: context do: [:stream |
		self emitClass: aClass on: stream].

!

createDocument: relativeFileName title: title context: context do: aBlock
	| stream path |

	path := File composePath: context outputDirectoryName subPath: relativeFileName.
	stream := HtmlWriteStream write: path.

	"Private - Emit the header info"
	[	stream 
			tag: 'html'; cr;
			tag: 'head'; cr;
			tag: 'title';
			nextPutAll: title;
			endtag: 'title'; cr; 
			endtag: 'head'.

		"Emit the body text"
		stream tag: 'body'; cr.
		self emitButtonBarOn: stream.
		stream tag: 'h1'; nextPutAll: title; endtag: 'h1'; cr.

		"Fill page"
		aBlock value: stream.

		stream tag: 'br'; tag: 'hr'.
		self emitButtonBarOn: stream.
		stream endtag: 'body'; cr.

		"Tidy up"
		stream endtag: 'html'; cr.
	] ensure: [stream close]!

createDocumentationFrom: context
	| allClasses categories protocols |
	allClasses := context allClasses.

	allClasses do: [:aClass | self createClassDocument: aClass context: context].

	context packages do: [:package | self createPackageDocument: package context: context].

	categories := Set new.
	allClasses do: [:aClass | categories addAll: aClass categories].
	categories do: [:aCategory | self createClassCategoryDocument: aCategory context: context].

	protocols := Set new.
	allClasses do: [:aClass | protocols addAll: aClass protocols].
	protocols do: [:protocol | self createProtocolDocument: protocol context: context].

	self createIndexDocumentContext: context.
	self createAllClassesDocument: allClasses context: context.
	self createAllCategoriesDocument: categories context: context.
	self createAllProtocolsDocument: protocols context: context.
	self createAllPackagesDocument: context packages context: context.

	context showIndexOnCompletion ifTrue: [
		ShellLibrary default shellOpen: self getFileNameForIndex directory: context outputDirectoryName].
!

createIndexDocumentContext: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: self getFileNameForIndex title: context title context: context do: [:stream |
		"nothing"].!

createPackageDocument: package context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: (self getFileNameForPackage: package) title: 'Package: ', package name context: context do: [:stream |
		self emitComment: package comment on: stream.
		stream tag: 'hr'.
		stream tag: 'h2'; nextPutAll: 'Classes'; endtag: 'h2'.
		self emitClassesAsTable: package classes asSortedCollection on: stream.
		stream tag: 'hr'.
		stream tag: 'h2'; nextPutAll: 'Loose Methods'; endtag: 'h2'.
		self emitMethodsAsTable: (package methods asSortedCollection: [:o1 :o2 | o1 printString <= o2 printString]) on: stream].!

createProtocolDocument: protocol context: context
	"Outputs an HTML file that documents aClass. The file is given a filename the same
	as the name of the class"

	self createDocument: (self getFileNameForProtocol: protocol) title: 'Protocol: ', protocol name context: context do: [:stream |
		self emitClassesAsTable: (protocol behaviors collect: [:behavior | behavior isMeta ifTrue: [behavior instanceClass] ifFalse:[behavior]]) asSet asSortedCollection on: stream].!

emitButtonBarOn: writeStream
	| separator |
	separator := ' - '.
	self emitReferenceUrl: self getFileNameForIndex as: 'Index' on: writeStream.
	writeStream nextPutAll: separator.
	self emitReferenceUrl: self getFileNameForAllPackages as: 'All Packages' on: writeStream.
	writeStream nextPutAll: separator.
	self emitReferenceUrl: self getFileNameForAllProtocols as: 'All Protocols' on: writeStream.
	writeStream nextPutAll: separator.
	self emitReferenceUrl: self getFileNameForAllCategories as: 'All Categories' on: writeStream.
	writeStream nextPutAll: separator.
	self emitReferenceUrl: self getFileNameForAllClasses as: 'All Classes' on: writeStream.
	writeStream tag: 'br'.
!

emitClass: aClass on: aStream 
	"Private - Emits body HTML that documents aClass to aStream"

	self emitComment: aClass comment on: aStream.
	aStream endtag: 'p'.

	self emitClassPackage: aClass on: aStream.
	self emitClassSuperclasses: aClass on: aStream.
	self emitClassSubclasses: aClass on: aStream.
	self emitClassProtocols: aClass on: aStream.
	self emitClassCategories: aClass on: aStream.

	self emitClassMethods: aClass on: aStream.
	self emitInstanceMethods: aClass on: aStream!

emitClassCategories: aClass on: aStream
	| categories |
	categories := aClass categories asSortedCollection.
	categories isEmpty ifTrue: [^self].

	aStream nextPutAll: 'Categories: '.
	categories
		do: [:category | self emitReferenceToCategory: category on: aStream]
		separatedBy: [aStream nextPutAll: ' '].
	aStream tag: 'br'.
!

emitClassesAsTable: classes on: stream
	stream tag: 'table'.
	classes do: [:aClass | | trimmedComment |
			stream tag: 'tr'; tag: 'td'.
			self emitReferenceToClass: aClass as: aClass name on: stream.
			stream endtag: 'td'; tag: 'td'.
			trimmedComment := self getCommentExtract: aClass comment.
			stream nextPutAll: '<font color="green">'; nextPutAll: trimmedComment; endtag: 'font'; endtag: 'td'; endtag: 'tr'; cr].
	stream endtag: 'table'.
!

emitClassMethods: aClass on: aStream
	"Private - Emits HTML that documents the class methods of aClass to aStream"

	self emitMethods: aClass class title: 'Class Methods' on: aStream


!

emitClassPackage: aClass on: aStream 
	| package |
	package := PackageManager current packageOfClass: aClass.
	package notNil ifTrue: [
		aStream nextPutAll: 'Package: '.
		self emitReferenceToPackage: package on: aStream.
		aStream tag: 'br'].!

emitClassProtocols: aClass on: aStream
	| protocols |
	protocols := aClass allProtocols asSortedCollection.
	protocols isEmpty ifTrue: [^self].

	aStream nextPutAll: 'Protocols: '.
	protocols
		do: [:protocol | self emitReferenceToProtocol: protocol on: aStream]
		separatedBy: [aStream nextPutAll: ' '].
	aStream tag: 'br'.
!

emitClassReferences: classes title: title on: aStream
	classes isEmpty ifTrue: [^self].

	aStream nextPutAll: title.
	classes
		do: [:aSubClass | self emitReferenceToClass: aSubClass as: aSubClass name on: aStream]
		separatedBy: [aStream nextPutAll: ' '].
	aStream tag: 'br'.
!

emitClassSubclasses: aClass on: aStream
	self
		emitClassReferences: aClass subclasses asSortedCollection
		title: 'Immediate Subclasses: '
		on: aStream!

emitClassSuperclasses: aClass on: aStream
	self
		emitClassReferences: aClass allSuperclasses reverse
		title: 'All Superclasses: '
		on: aStream!

emitComment: commentString on: aStream
	"Private - Emit the newline separated comment with appropriately inserted
	hard-line breaks to replace the line delimiters."

	| formattedComment |
	formattedComment := self formatClassReferences: commentString.
	formattedComment := self formatMethodReferences: formattedComment .

	aStream nextPutAll: '<font color="green">'.
	formattedComment withNormalizedLineDelimiters lines do: [:line | aStream nextPutAll: line; tag: 'br'].
	aStream nextPutAll: '</font>'.
!

emitInstanceMethods: aClass on: aStream
	"Private - Emits HTML that documents the instance methods of aClass to aStream"

	self emitMethods: aClass title: 'Instance Methods' on: aStream



!

emitMethodOverride: method on: aStream
	method isOverride ifTrue: [ | overrideMethod |
		aStream tag: 'br'.
		aStream nextPutAll: 'Overrides: '.
		overrideMethod := method methodClass superclass lookupMethod: method selector.
		self emitReferenceToClass: overrideMethod methodClass selector: overrideMethod selector as: overrideMethod methodClass name on: aStream].

	method isOverridden ifTrue: [
		aStream tag: 'br'.
		aStream nextPutAll: 'Overridden by: '.
		method methodClass allSubclassesDo: [:aClass |
			(aClass includesSelector: method selector) ifTrue: [
				self emitReferenceToClass: aClass selector: method selector as: aClass name on: aStream.
				aStream nextPutAll: ' ']]].

	method isLoose ifTrue: [
		aStream tag: 'br'.
		aStream nextPutAll: 'Package: '.
		self emitReferenceToPackage: method owningPackage on: aStream].!

emitMethods: aClass title: aStringTitle on: aStream
	"Private - Emits HTML that documents the instance methods of aClass to aStream.
	The section is given aStringTitle."

	| selectors method comment |
	selectors := aClass selectors asSortedCollection.
	selectors isEmpty ifFalse: [
		aStream 
			tag:'hr';
			tag: 'h2';
			nextPutAll: aStringTitle;
			endtag: 'h3'.

		selectors do: [ :each | | methodTitle |
			method := aClass compiledMethodAt: each.
			method isPublic ifTrue: [
				comment := self methodComment: method.
				methodTitle := self getMethodTitle: method.
				aStream
					nextPutAll: '<a name="#';nextPutAll: each; nextPutAll: '">';
					tag: 'h4'.
					methodTitle keysAndValuesDo: [:index :eachTitle |
						index odd
							ifTrue: [aStream 
								tag: 'font color="blue"';
								nextPutAll: eachTitle;
								endtag: 'font';
								nextPutAll: ' ']
							ifFalse: [aStream
								nextPutAll: eachTitle;
								nextPutAll: ' ']].
				aStream
					endtag: 'h4';
					nextPutAll: '</a>';
					tag: 'blockquote'.
				self emitComment: comment on: aStream.
				self emitMethodOverride: method on: aStream.
				aStream endtag: 'blockquote']]]

!

emitMethodsAsTable: methods on: stream
	stream tag: 'table'.
	methods do: [:method | | trimmedComment |
			stream tag: 'tr'; tag: 'td'.
			self emitReferenceToMethod: method on: stream.
			stream endtag: 'td'; tag: 'td'.
			trimmedComment := self getCommentExtract: (self methodComment: method).
			stream nextPutAll: '<font color="green">'; nextPutAll: trimmedComment; endtag: 'font'; endtag: 'td'; endtag: 'tr'; cr].
	stream endtag: 'table'.
!

emitPackagesAsTable: packages on: stream
	stream tag: 'table'.
	packages do: [:package | | trimmedComment |
			stream tag: 'tr'; tag: 'td'.
			self emitReferenceToPackage: package on: stream.
			stream endtag: 'td'; tag: 'td'.
			trimmedComment := self getCommentExtract: package comment.
			stream nextPutAll: '<font color="green">'; nextPutAll: trimmedComment; endtag: 'font'; endtag: 'td'; endtag: 'tr'; cr].
	stream endtag: 'table'.
!

emitReferenceToCategory: aCategory on: writeStream
	self
		emitReferenceUrl: (self getFileNameForCategory: aCategory)
		as: aCategory name
		on: writeStream!

emitReferenceToClass: aClass as: classDescription on: writeStream
	self
		emitReferenceUrl: (self getFileNameForClass: aClass)
		as: classDescription
		on: writeStream!

emitReferenceToClass: aClass selector: selector as: title on: writeStream
	self
		emitReferenceUrl: (self getFileNameForClass: aClass), '#', selector
		as: title
		on: writeStream!

emitReferenceToMethod: method on: writeStream
	self
		emitReferenceToClass: method methodClass
		selector: method selector
		as: method methodClass name, '>>', method selector
		on: writeStream!

emitReferenceToPackage: aPackage on: writeStream
	self
		emitReferenceUrl: (self getFileNameForPackage: aPackage)
		as: aPackage name
		on: writeStream!

emitReferenceToProtocol: aProtocol on: writeStream
	self
		emitReferenceUrl: (self getFileNameForProtocol: aProtocol)
		as: aProtocol name
		on: writeStream!

emitReferenceToSelector: selector as: title on: writeStream
	self
		emitReferenceUrl: '#', selector
		as: title
		on: writeStream!

emitReferenceToSelector: selector on: writeStream
	self
		emitReferenceUrl: '#', selector
		as: '#', selector
		on: writeStream!

emitReferenceUrl: relativeUrl as: title on: writeStream
	#todo "Private - not good enough".
	writeStream
		nextPutAll: '<a href="';
		nextPutAll: relativeUrl;
		nextPutAll: '">';
		nextPutAll: title;
		nextPutAll: '</a>'.
!

fileExtension
	^'html'
!

findEndOfSelector: commentString from: start
	| index c validSelectorChars |
	validSelectorChars :=  self getBinarySelectorCharacters, ':'.
	index := start.
	[index <= commentString size and: [(c := commentString at: index) isAlphaNumeric or: [validSelectorChars identityIncludes: c]]]
		whileTrue: [index := index + 1].
	^index - 1!

formatClassReferences: commentString
	| writeStream index startOfWord c |
	writeStream := commentString class writeStream: commentString size.

	index := 1.
	[index <= commentString size] whileTrue: [
		(index <= commentString size and: [(c := commentString at: index) isAlphaNumeric or: [c == $_]]) ifTrue: [ | className isClass word |
			startOfWord := index.
			index := index + 1.
			[index <= commentString size and: [(c := commentString at: index) isAlphaNumeric or: [c == $_]]] whileTrue: [index := index + 1].
			className := word := commentString copyFrom: startOfWord to: index - 1.
			isClass := self isClassName: className.
			(isClass not and: [word last == $s]) ifTrue: [
				className := word copyFrom: 1 to: word size - 1.
				isClass := self isClassName: className].
			(isClass not and: [word beginsWith: 'a']) ifTrue: [
				className := word copyFrom: 2 to: word size.
				isClass := self isClassName: className].
			(isClass not and: [word beginsWith: 'an']) ifTrue: [
				className := word copyFrom: 3 to: word size.
				isClass := self isClassName: className].
			isClass
				ifTrue: [self emitReferenceToClass: (Smalltalk at: className asSymbol) as: word on: writeStream]
				ifFalse: [writeStream nextPutAll: word]].

		(index <= commentString size) ifTrue: [
			startOfWord := index.
			[index <= commentString size and: [(c := commentString at: index) isAlphaNumeric not and: [c ~~ $_]]] whileTrue: [index := index + 1].
			writeStream nextPutAll: (commentString copyFrom: startOfWord to: index - 1)]].
	^writeStream contents
		!

formatMethodReferences: commentString
	| writeStream start end index endOfSelector |
	writeStream := commentString class writeStream: commentString size.

	start := 1.
	end := commentString size.
	[index := commentString nextIndexOf: $# from: start to: commentString size. index ~= 0] whileTrue: [ | selector |
		"Private - there should be a more efficient way of doing this copying"
		writeStream nextPutAll: (commentString copyFrom: start to: index - 1).
		endOfSelector := self findEndOfSelector: commentString from: index + 1.
		selector := commentString copyFrom: index + 1 to: endOfSelector.
		self emitReferenceToSelector: selector on: writeStream.
		start := endOfSelector + 1].
	writeStream nextPutAll: (commentString copyFrom: start to: end).

	^writeStream contents
		!

getBinarySelectorCharacters
	"Private - this magic string was taken from Symbol#isLiteralSymbol:"
	^ '!!%&*+,/<=>?@\~|-'!

getCommentExtract: comment
	| trimmedComment extractSize |
	extractSize := 100.
	trimmedComment := comment leftString: extractSize.
	trimmedComment size = extractSize ifTrue: [trimmedComment := trimmedComment, '...'].
	^trimmedComment!

getFileName: stem
	| copiedStem |
	"Private - should ask the system for this - instead found the list by supplying bad name in MS Explorer"
	copiedStem := stem copy.
	copiedStem keysAndValuesDo: [:index :char |
		(BadFileNameCharacters includes: char) ifTrue: [copiedStem at: index put: $_]].

	^File composeStem: copiedStem extension: self fileExtension
!

getFileNameForAllCategories
	^self getFileName: 'AllCategories'!

getFileNameForAllClasses
	^self getFileName: 'AllClasses'!

getFileNameForAllPackages
	^self getFileName: 'AllPackages'!

getFileNameForAllProtocols
	^self getFileName: 'AllProtocols'!

getFileNameForCategory: aCategory
	^self getFileName: 'Category_', aCategory name!

getFileNameForClass: aClass
	| fileName |
	fileName := aClass isMeta
		ifTrue: [aClass instanceClass name]
		ifFalse: [aClass name].
	^self getFileName: fileName asString!

getFileNameForIndex
	^self getFileName: 'index'!

getFileNameForPackage: aPackage
	^self getFileName: 'Package_', aPackage name!

getFileNameForProtocol: aProtocol
	^self getFileName: 'Protocol_', aProtocol name!

getMethodTitle: method
	| parameters |
	parameters := method selector occurrencesOf: $:.
	parameters == 0 ifTrue: [
		(self getBinarySelectorCharacters includes: method selector first)
			ifTrue: [parameters := 1]
			ifFalse: [^Array with: method selector]].
	
	^self subStrings: method getSource upToSize: parameters * 2!

isClassName: word
	| symbol |
	symbol := Symbol findInterned: word.
	^symbol notNil and: [(Smalltalk at: symbol ifAbsent: [nil]) isKindOf: Behavior]!

methodComment: aCompiledMethod
	"Private - "
	| source index comment start stop |
	source := aCompiledMethod getSource.
	index := (source identityIndexOf: Character tab)+1.
	(index > source size or: [(source at: index) ~= $"]) ifTrue: [^String empty].

	start := index+1.
	stop := source nextIdentityIndexOf: $" from: start+1 to: source size.
	comment := source midString: stop-start from: start.

	^comment
	
!

subStrings: string upToSize: size
	"Answer an Array containing the substrings of the receiver which are separated by one or 
	more Characters which answer true to #isSeparator."

	| aStream answer wordStream next |
	answer := OrderedCollection new: size.
	aStream := string readStream.
	wordStream := string species writeStream: 10.
	[aStream atEnd or: [answer size >= size]] whileFalse: [
		wordStream reset.
		[aStream atEnd or: [(next:= aStream next) isSeparator]]
			whileFalse: [wordStream nextPut: next].
		next := wordStream contents.
		next isEmpty ifFalse: [answer add: next]].
	^answer asArray! !
!SourceDocumenter categoriesFor: #createAllCategoriesDocument:context:!public! !
!SourceDocumenter categoriesFor: #createAllClassesDocument:context:!public! !
!SourceDocumenter categoriesFor: #createAllPackagesDocument:context:!public! !
!SourceDocumenter categoriesFor: #createAllProtocolsDocument:context:!public! !
!SourceDocumenter categoriesFor: #createClassCategoryDocument:context:!public! !
!SourceDocumenter categoriesFor: #createClassDocument:context:!public! !
!SourceDocumenter categoriesFor: #createDocument:title:context:do:!private! !
!SourceDocumenter categoriesFor: #createDocumentationFrom:!public! !
!SourceDocumenter categoriesFor: #createIndexDocumentContext:!public! !
!SourceDocumenter categoriesFor: #createPackageDocument:context:!public! !
!SourceDocumenter categoriesFor: #createProtocolDocument:context:!public! !
!SourceDocumenter categoriesFor: #emitButtonBarOn:!private! !
!SourceDocumenter categoriesFor: #emitClass:on:!private! !
!SourceDocumenter categoriesFor: #emitClassCategories:on:!private! !
!SourceDocumenter categoriesFor: #emitClassesAsTable:on:!private! !
!SourceDocumenter categoriesFor: #emitClassMethods:on:!private! !
!SourceDocumenter categoriesFor: #emitClassPackage:on:!private! !
!SourceDocumenter categoriesFor: #emitClassProtocols:on:!private! !
!SourceDocumenter categoriesFor: #emitClassReferences:title:on:!private! !
!SourceDocumenter categoriesFor: #emitClassSubclasses:on:!private! !
!SourceDocumenter categoriesFor: #emitClassSuperclasses:on:!private! !
!SourceDocumenter categoriesFor: #emitComment:on:!private! !
!SourceDocumenter categoriesFor: #emitInstanceMethods:on:!private! !
!SourceDocumenter categoriesFor: #emitMethodOverride:on:!private! !
!SourceDocumenter categoriesFor: #emitMethods:title:on:!private! !
!SourceDocumenter categoriesFor: #emitMethodsAsTable:on:!private! !
!SourceDocumenter categoriesFor: #emitPackagesAsTable:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToCategory:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToClass:as:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToClass:selector:as:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToMethod:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToPackage:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToProtocol:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToSelector:as:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceToSelector:on:!private! !
!SourceDocumenter categoriesFor: #emitReferenceUrl:as:on:!private! !
!SourceDocumenter categoriesFor: #fileExtension!private! !
!SourceDocumenter categoriesFor: #findEndOfSelector:from:!private! !
!SourceDocumenter categoriesFor: #formatClassReferences:!private! !
!SourceDocumenter categoriesFor: #formatMethodReferences:!private! !
!SourceDocumenter categoriesFor: #getBinarySelectorCharacters!private! !
!SourceDocumenter categoriesFor: #getCommentExtract:!private! !
!SourceDocumenter categoriesFor: #getFileName:!private! !
!SourceDocumenter categoriesFor: #getFileNameForAllCategories!private! !
!SourceDocumenter categoriesFor: #getFileNameForAllClasses!private! !
!SourceDocumenter categoriesFor: #getFileNameForAllPackages!private! !
!SourceDocumenter categoriesFor: #getFileNameForAllProtocols!private! !
!SourceDocumenter categoriesFor: #getFileNameForCategory:!private! !
!SourceDocumenter categoriesFor: #getFileNameForClass:!private! !
!SourceDocumenter categoriesFor: #getFileNameForIndex!private! !
!SourceDocumenter categoriesFor: #getFileNameForPackage:!private! !
!SourceDocumenter categoriesFor: #getFileNameForProtocol:!private! !
!SourceDocumenter categoriesFor: #getMethodTitle:!private! !
!SourceDocumenter categoriesFor: #isClassName:!private! !
!SourceDocumenter categoriesFor: #methodComment:!private! !
!SourceDocumenter categoriesFor: #subStrings:upToSize:!private! !

!SourceDocumenter class methodsFor!

example1
	"
		self example1
	"

	self onPackage: (PackageManager current packageNamed: 'Playground')
!

initialize
"
SourceDocumenter initialize.
"
	BadFileNameCharacters := IdentitySet withAll: '\/:*?"<>|'.!

onEntireSystem
"
	self onEntireSystem
"
	| context |
	context := SourceDocumenterContext new.
	context packages addAll: PackageManager current packages.
	self new createDocumentationFrom: context!

onPackage: aPackage
	| context |
	context := SourceDocumenterContext new.
	context packages add: aPackage.
	self new createDocumentationFrom: context! !
!SourceDocumenter class categoriesFor: #example1!public! !
!SourceDocumenter class categoriesFor: #initialize!private! !
!SourceDocumenter class categoriesFor: #onEntireSystem!public! !
!SourceDocumenter class categoriesFor: #onPackage:!public! !

SourceDocumenterContext guid: (GUID fromString: '{1F1A14A2-ADDB-40BB-A2B0-712C0A2FC3BE}')!
SourceDocumenterContext comment: ''!
!SourceDocumenterContext categoriesForClass!Unclassified! !
!SourceDocumenterContext methodsFor!

allClasses
	| allClasses |
	allClasses := IdentitySet new.
	allClasses addAll: self classes.
	self packages do: [:package | allClasses addAll: package classes].
	^allClasses!

classes
	"Answer the value of the receiver's ''classes'' instance variable."

	^classes!

classes: anObject
	"Private - Set the value of the receiver's ''classes'' instance variable to the argument, anObject."

	classes := anObject!

initialize
	self classes: OrderedCollection new.
	self packages: OrderedCollection new.
	self outputDirectoryName: SessionManager current imageBase.
	self showIndexOnCompletion: true.
	self title: 'Dolphin Source Code'.!

outputDirectoryName
	"Answer the value of the receiver's ''outputDirectoryName'' instance variable."

	^outputDirectoryName!

outputDirectoryName: anObject
	"Set the value of the receiver's ''outputDirectoryName'' instance variable to the argument, anObject."

	outputDirectoryName := anObject!

packages
	"Answer the value of the receiver's ''packages'' instance variable."

	^packages!

packages: anObject
	"Private - Set the value of the receiver's ''packages'' instance variable to the argument, anObject."

	packages := anObject!

showIndexOnCompletion
	"Answer the value of the receiver's ''showIndexOnCompletion'' instance variable."

	^showIndexOnCompletion!

showIndexOnCompletion: anObject
	"Set the value of the receiver's ''showIndexOnCompletion'' instance variable to the argument, anObject."

	showIndexOnCompletion := anObject!

title
	"Answer the value of the receiver's ''title'' instance variable."

	^title!

title: anObject
	"Set the value of the receiver's ''title'' instance variable to the argument, anObject."

	title := anObject! !
!SourceDocumenterContext categoriesFor: #allClasses!public! !
!SourceDocumenterContext categoriesFor: #classes!public! !
!SourceDocumenterContext categoriesFor: #classes:!public! !
!SourceDocumenterContext categoriesFor: #initialize!public! !
!SourceDocumenterContext categoriesFor: #outputDirectoryName!accessing!public! !
!SourceDocumenterContext categoriesFor: #outputDirectoryName:!accessing!public! !
!SourceDocumenterContext categoriesFor: #packages!public! !
!SourceDocumenterContext categoriesFor: #packages:!public! !
!SourceDocumenterContext categoriesFor: #showIndexOnCompletion!accessing!public! !
!SourceDocumenterContext categoriesFor: #showIndexOnCompletion:!accessing!public! !
!SourceDocumenterContext categoriesFor: #title!accessing!public! !
!SourceDocumenterContext categoriesFor: #title:!accessing!public! !

!SourceDocumenterContext class methodsFor!

new
	^super new
		initialize;
		yourself! !
!SourceDocumenterContext class categoriesFor: #new!public! !

HtmlWriteStream guid: (GUID fromString: '{AB0BA44D-1A8E-4548-AD94-4AC332EF45E7}')!
HtmlWriteStream comment: 'HtmlWriteStream code kindly donated by Diego Coronel.
'!
!HtmlWriteStream categoriesForClass!Collections-Streams! !
!HtmlWriteStream methodsFor!

endtag: aString

	self 
		nextPut: $<;
		nextPut: $/;
		nextPutAll:  aString;
		nextPut: $>
!

tag: aString

	self 
		nextPut: $<;
		nextPutAll:  aString;
		nextPut: $>
! !
!HtmlWriteStream categoriesFor: #endtag:!public! !
!HtmlWriteStream categoriesFor: #tag:!public! !

"Binary Globals"!

"Resources"!

