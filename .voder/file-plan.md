## NOW  
Append the following to `.voderignore` to hide all test code and dramatically cut context size:  
```
# Hide all test files
test/**
```  

## NEXT  
Append to `.voderignore` to hide repository metadata and documentation:  
```
# Hide GitHub metadata and workflows
.github/**

# Hide all documentation
docs/**
```  

## LATER  
Evaluate moving large fixtures, docs or seldom‐used configs into a separate archive or repo and prune any other rarely accessed files to further slim the assistant’s context.