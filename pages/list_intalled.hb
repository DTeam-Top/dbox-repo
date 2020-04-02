<div class="tableFixHead">
  <table class="table">
    <thead class="thead-light">
      <tr>
        <th scope="col">{{localize "table.thead.id"}}</th>
        <th scope="col">{{localize "table.thead.version"}}</th>
        <th scope="col">{{localize "table.thead.description"}}</th>
        <th scope="col">{{localize "table.thead.enabled"}}</th>
        <th scopt="col">{{localize "table.thead.repository"}}</th>
      </tr>
    </thead>
    <tbody>
      {{#each extensionInstalled}}
        <tr>
          <td scope="row">{{extId}}</td>
          <td>{{version}}</td>
          <td>{{describe}}</td>
          <td>
            {{#if enabled}} √ {{else}} X {{/if}}
          </td>
          <td>{{repository}}</td>
        </tr>
        {{/each}}
    </tbody>
  </table>
</div>