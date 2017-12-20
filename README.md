# Ontimize Web FileManager

* [Github repository](#github)
<!-- * [Examples](#examples) -->
* [Installation](#installation)
<!-- * [Usage](#usage) -->

## Github
Ontimize Web FileManager module is stored in [github](https://github.com/OntimizeWeb/ontimize-web-ngx-filemanager){:target="_blank"} where you can also see/add todos, bugs or feature requests in the [issues](https://github.com/OntimizeWeb/ontimize-web-ngx-filemanager/issues){:target="_blank"} section.

<!-- ## Examples

Check out examples demo:
<div>
  <a href="https://ontimizeweb.github.io/ontimize-web-ngx-filemanager" target="_blank" class="btn btn--success">
    <i class="fa fa-play"></i>
    live demo
  </a>
</div> -->


## Installation

```bash
  npm install ontimize-web-ngx-filemanager --save
```

## Usage

Finally, you can use ontimize-web-ngx-filemanager in your Ontimize Web project.

### Configure angular-cli.json dependencies

You must add the module styles definition in your '*.angular-cli.json*' file styles array:

```bash
...
"styles": [
  ...
  "../node_modules/ontimize-web-ngx-filemanager/styles.scss",
  ....
],
...
```

### Import in an application module

Include the library filemanager module into your app in the module where you want to use it.

```bash
...
import { OFileManagerModule } from 'ontimize-web-ngx-filemanager';
...

@NgModule({
  imports: [
    OFileManagerModule,
    /* other imports */
  ],
  declarations: ...
  providers: ...
})
export class ExampleModule { }
```