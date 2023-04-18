export class CommandBarItem {
    id:string;
    additional_data:object;
    image:string;
    include_events:string;
    label:string;
    name:string;
    on_click_handler:string;
    on_init_handler:string;
    tooltip_template:string;
    data:CommandBarItem[];
    checked:boolean;
    hidden:boolean;
    disabled:boolean;
    fill:boolean;
    options:any;
    cui_icon_ref:string;
    cui_ctrl:string;
    onClick:(e:MouseEvent)=>void;

}