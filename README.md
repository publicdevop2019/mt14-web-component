## Publish to npm repository
    0. open package.json, increase version number then save & continue  
    1. run --> npm run build
    2. run --> npm login  
    3. change to dist folder  
    4. npm publish
    5. copy scripts.js to target angular app assets folder, can update index.html to import it  
## Host build output in local server
    0. run --> npm run build  
    1. change to server folder and run --> npm start  
    2. content is hosted at http://localhost:4040/{component-name} e.g http://localhost:4040/product  

## Current issue with writing web component with angular
1. when embedded angular in angular app, scripts.js needs to be put in index.html, will not work if import from @node_module
2. wc in React app, property value is not getting set (a.k.a @Input() for complex object, simple string is fine)