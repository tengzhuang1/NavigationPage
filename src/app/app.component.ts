import { Component } from '@angular/core';
import {HttpClient,HttpHeaders  } from '@angular/common/http';
import {CommandBarItem} from './models/CommandBarItem';
import { Expansion } from '@angular/compiler';

@Component({
  selector: 'navigation-page',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoading:boolean=true;

  mainWnd:any;
  aras:any;
  title = 'NavigationPage';
  itemtypeName:string;
  itemtypeId:string;
  itemtype:any;

  commands:CommandBarItem[]=[];

  constructor(private http: HttpClient){
    this.mainWnd=top;
    this.aras=this.mainWnd.aras;
    this.getUrlParams();
  }

  ngOnInit(){
    this.getItemTypeInfo().then(()=>{
      this.getConfigurableUi().then(()=>{
        this.isLoading=false;
      });
    });
  }

  async getConfigurableUi(){
		const params = {
      item_type_id: this.itemtypeId,
      location_name: 'NavigationView',
		};

    //返回XML格式
    // this.aras.MetadataCache.GetConfigurableUiAsync(params).then((result:any)=>{
      
    // });

    //返回JSON格式
    const commands:CommandBarItem[]=await this.aras.MetadataCacheJson.GetConfigurableUiAsync(params);

    const callInitMethods=(commands:CommandBarItem[])=>{
      commands.filter(command => command.on_init_handler).forEach((command:any)=>{
        const newData=this.executeMethod({ 
          id: command.on_init_handler,
          keyed_name: command["on_init_handler@keyed_name"]
        },command);

        Object.assign(command
          , this.normalizeJson(command.additional_data)
          , this.normalizeJson(newData));
      })
    }

    callInitMethods(commands);
    this.commands=commands;
  }

  /**
   * 获取当前页面参数
   */
  getUrlParams(){
    const searchParams = new URLSearchParams(window.location.search);
    const itemtype=searchParams.get('itemtype');
    if(!itemtype){
      throw new Error('itemtype not found');
    }
    this.itemtypeName =itemtype;
  }

  /**
   * 直接通过HTTP请求查询
   */
  getConfigurableUiByHttp(){
    const token = this.mainWnd.OAuthClient.getToken();
    const metadataURL='http://localhost/aras2023/Server/MetaData.asmx/GetConfigurableUi';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const lang=this.aras.getSessionContextLanguageCode();
    const loginUser=this.aras.getCurrentLoginName();
    const params = {
			accept: 'json',
      database: 'JILIN_POC',
      date: '2023-04-17T05:49:53.68',
      item_classification: '',
      item_id: 'C720A564F0634518829FB154CC3CAC6F',
      item_type_id: '4F1AC04A2B484F3ABA4E20DB63808A88',
      lang: lang,
      location_name: 'SearchView.CommandBar',
      user: loginUser
		};
    this.http.get(metadataURL, {headers,params:params}).subscribe(() => {
      console.log('User created successfully.');
    });
  }

  async getItemTypeInfo(){
    this.itemtype=await this.aras.MetadataCacheJson.GetItemType(this.itemtypeName,'name');
    this.itemtypeId=this.itemtype.id;
  }

  executeMethod(method:any, command:CommandBarItem, args?:any){
    var methodNd = this.aras.getItemById('Method', method.id);
    let isJsMethod  = this.aras.getItemProperty(methodNd, "method_type") === "JavaScript";
    if (isJsMethod) {
      const method = new Function(
        'inArgs', 
        'options',
        'aras',
        methodNd.selectSingleNode('method_code').textContent
      );

      const inArgs = Object.assign({ 
        control: Object.assign({}, command)
      }, args || {});
      const options={
        itemTypeName:this.itemtypeName,
        itemType:this.itemtype,
      }

      try {
        return method(inArgs,options
          , this.aras);
      } catch (e:any) {
        let message = e.number || e.description
          ? this.aras.getResource('', 'aras_object.aras_object', e.number, e.description || e.message)
          : e.message || e.toString();
        message = message.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
        this.aras.AlertError(
          this.aras.getResource(
            '',
            'aras_object.method_failed',
            this.aras.getItemProperty(methodNd, 'name')
          ) + ' ' + message,
          e.toString(),
          e.stack || this.aras.getResource('', 'common.client_side_err')
        );
      }
    } else {
      let inDom = this.aras.newItem(`<Item type="Method" />`);
      inDom.setAttribute("action", method.keyed_name);
      var res = this.aras.soapSend("ApplyItem", inDom.outerHTML);
      if (res.getFaultCode() != 0) {
        throw res;
      }
      return res;
    }
  }

  normalizeJson(command:any) {
    if (!command)
      return command;

    if ("cui_items" in command) {
      command.options = command.cui_items;
      delete command.cui_items;
    }
    if ("options" in command) {
      command.options.forEach((c:any, i:any) => {
        c.checked = i === 0;
      });
    }
    
    if ("children" in command) {
      command.children.forEach(this.normalizeJson);
      command.data = command.children;
    }

    if ("cui_checked" in command) {
      command.checked = command.cui_checked;
      delete command.cui_checked;
    }

    if ("cui_disabled" in command) {
      command.disabled = command.cui_disabled && command.cui_disabled !== "false";
      delete command.cui_disabled;
    }

    if ("cui_invisible" in command) {
      command.hidden = command.cui_invisible;
      delete command.cui_invisible;
    }

    if ("tooltip" in command)
    {
      command.tooltip_template = command.tooltip;
      delete command.tooltip;
    }

    return command;
  }
}
