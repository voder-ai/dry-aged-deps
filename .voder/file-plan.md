## NOW  
Append the following single line to `.voderignore` to hide all Markdown files (README, CHANGELOG, etc.):  
```diff
 .voderignore
+# Hide all Markdown docs
 *.md
```

## NEXT  
Append the following single line to `.voderignore` to hide any patch files:  
```diff
 .voderignore
+# Hide patch files
 *.patch
```

## LATER  
Consider archiving or relocating large or infrequently used assets (fixtures, generated configs, example repos) into a separate archive or repo to further reduce context size.