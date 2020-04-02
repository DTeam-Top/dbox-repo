{{#each extensions}}
  <div class="row vertical-align extension-item" >
      <div class="col-1 text-center extension-img">
          {{#if extension.icon}}
            <img src="{{extension.icon}}" width="50px">
          {{else}}
            <img src="shared/imgs/extention.png" width="50px">
          {{/if}}
      </div>
      <div class="col-8 no-padding">
        <div class="container">
          <div class="row">
            <div class="col-12 list-title">
              {{extension.extId}}
              <span class="version">{{extension.currentVersion}}</span>
            </div>
            <div class="col-12">
              {{extension.describe}}
            </div>
            <div class="col-12">
              {{localize "title.releasedon"}}&nbsp;&nbsp;{{formatDate extension.dateCreated}}&nbsp;&nbsp;&nbsp;&nbsp;{{localize "title.lastupdated"}}&nbsp;&nbsp;{{formatDate extension.lastUpdate}}
            </div>
          </div>
        </div>
      </div>
      <div class="col-2 extension-btn">
        <button type="button" class="btn btn-success btn-sm" onclick="showExtension('{{../title}}','{{extension.extId}}',{{installed}})">{{localize "title.showme"}}</button>
      </div>
  </div>
{{/each}}