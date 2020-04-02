<div class="container example">
<nav class="example-nav">
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <a class="nav-item nav-link active" id="nav-setting-tab" data-toggle="tab" href="#nav-setting" role="tab" aria-controls="nav-setting" aria-selected="true">{{localize "title.setting"}}</a>
      <a class="nav-item nav-link" id="nav-example" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">{{localize "title.example"}}</a>
    </div>
</nav>
<hr>
<div class="tab-content exampletab-content" id="nav-tabContent">
  <div class="tab-pane fade show active" id="nav-setting" role="tabpanel" aria-labelledby="nav-setting-tab">
    <div class="row" style="padding-left: 20px;width:99.9%">
    <div class="col-4 setting-container example-div">
    {{localize "example.description"}}
    <ul>
      <li>{{localize "example.description.li1"}}</li>
      <li>{{localize "example.description.li2"}}</li>
      <li>{{localize "example.description.li3"}}</li>
    </ul>
    </div>
    <div class="col-8 setting-container ">
      <textarea id="setting-textarea">{{repositories}}</textarea>
    </div>
    <div class="col-12 text-right button-div">
      <button type="button" class="btn btn-secondary btn-sm" onclick="cancelSetting()">{{localize "title.cancel"}}</button>
      <button type="button" class="btn btn-primary btn-sm" onclick="submitRepositories()">{{localize "title.submit"}}</button>
    </div>
  </div>
  </div>
  <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-example">
    <textarea id="example-textarea" readonly>{{example}}</textarea>
    <div class="col-12 text-right button-div">
      <button type="button" class="btn btn-info btn-sm" onclick="copyToClipboard()">{{localize "title.copy"}}</button>
    </div>
  </div>
</div>
</div>
