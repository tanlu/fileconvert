import{b as o,e as r}from"./vendor-f6f18e65.js";import{c as s}from"./config-8adb8f72.js";import{F as i}from"./libs-250e5f01.js";const m=o("user",{state:()=>({loginFrom:"",userId:"",token:"",expiryTime:0,userName:"",account:"",isDomestic:!0,userType:s.userTypeNormal,sort:0,displayMode:"",userTypeTime:0,shareExpiry:"",savecopy:""}),persist:{key:s.appName+"-user"},actions:{setUser(e){this.loginFrom=e.loginFrom?e.loginFrom:"",this.token=e.token,this.expiryTime=e.expiryTime?e.expiryTime:0,this.userId=e.userId?e.userId:"",this.userName=e.userName?e.userName:"",this.account=e.account?e.account:"",this.isDomestic=e.isDomestic!==void 0?e.isDomestic:!0,r.setUserId(this.userId),i.uidConfig(this.userId)},setUserName(e){this.userName=e.userName},setAccount(e){this.account=e.account},setUserType(e){this.userType=e.userType},setUserTypeTime(e){this.userTypeTime=e.userTypeTime},setSort(e){this.sort=e.sort},setDisplayMode(e){this.displayMode=e.displayMode},setShareExpiry(e){this.shareExpiry=e.shareExpiry},setSaveCopy(e){this.savecopy=e,window.localStorage.setItem("savecopy",e)},clear(){this.$patch({loginFrom:"",userId:"",token:"",expiryTime:0,userName:"",account:"",isDomestic:!0,userType:s.userTypeNormal,sort:0,displayMode:"",userTypeTime:0,shareExpiry:""}),r.setUserId(""),i.uidConfig("")}}});export{m as u};
