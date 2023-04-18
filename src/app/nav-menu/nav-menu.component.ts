import { Component, OnInit ,Input ,Output,EventEmitter } from '@angular/core';
import { CommandBarItem } from '../models/CommandBarItem'

@Component({
  selector: 'nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  @Input() options:CommandBarItem
  @Input() aras:any;

  @Output() executeEvent = new EventEmitter();

  iconUrl:string='../../images/ItemType.svg';

  constructor() { 
    
  }

  ngOnInit() {
    if(this.options.image){
      if(this.options.image.startsWith('vault:///?fileId=')){
        const fileId=this.options.image.replace('vault:///?fileId=','');
        this.iconUrl =  this.aras.IomInnovator.getFileUrl(fileId, this.aras.Enums.UrlType.SecurityToken);
      }else{
        this.iconUrl = this.aras.getScriptsURL()+this.options.image;
      }
    }
  }

  onButtonClick(event:MouseEvent){
    if(!this.options.on_click_handler) return;
    const command:any=this.options;
    this.executeEvent.emit({ 
      id: command.on_click_handler,
      keyed_name: command["on_click_handler@keyed_name"]
    });
  }

}
