## Publish to npm repository
    0. open package.json, increase version number then save & continue  
    1. npm run build
    2. npm login  
    3. cd dist  
    4. npm publish
    5. copy scripts.js to target angular app assets folder, can update index.html to import it  
    6. copy styles.css to target angular app where web component is imported  
## Host build output in local server
    0. cd ./ng-wc/product  
    0. npm run build  
    1. open html file located at demo folder
## Current issue with writing web component with angular
1. when embedded angular in angular app, scripts.js needs to be put in index.html, will not work if import from @node_module
2. wc in React app, property value is not getting set (a.k.a @Input() for complex object, simple string is fine