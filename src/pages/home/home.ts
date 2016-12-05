import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {Platform} from 'ionic-angular';
import { Md5 } from "ts-md5/dist/md5";
import { SQLite } from 'ionic-native';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  username: string;
  password: string;
  db: SQLite;

  constructor(public navCtrl: NavController,public alertCtrl: AlertController,public platform: Platform) {    
        platform.ready().then(() => {
          this.db = new SQLite();
          this.createTable();
        });
  }

  public createTable(){
     this.db.openDatabase({
      name: 'data.db',
      location: 'default' // the location field is required
    }).then(() => {
        this.db.executeSql('CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY AUTOINCREMENT,username VARCHAR(255), password VARCHAR(255))', {}).then(() => {
      }, (err) => {
        this.createAlert(err,'Unable to execute sql: ');
      });
    }, (err) => {
      this.createAlert(err,'Unable to open database: ');
    });
  }

  public login(){
   if(this.username && this.password){
      this.autenticacao();
    }else{
      this.createAlert("Por favor, preencha o Login e a Senha!","Erro");
    }
  }

  public autenticacao(){    
      this.db.executeSql('SELECT password FROM user WHERE username = ?', [this.username]).then((data) => {
          if(data.rows.length > 0){
              let password = data.rows.item(0).password;
              if(password == Md5.hashStr(this.password)){
                this.createAlert("Bem Vindo!","Sucesso");
              }else{
                this.createAlert("Credenciais incorretas","Erro");
              }
          }else{
            this.insertUser();
          }
      }, (err) => {
        this.createAlert(err,'Erro ao obter usuário: ');
      });
  }

  public insertUser(){
      this.db.executeSql('INSERT INTO user (username, password) VALUES (?,?)', [this.username,Md5.hashStr(this.password).toString()]).then((data) => {
        this.createAlert("Cadastrado com Sucesso!","Sucesso");
      }, (err) => {
        this.createAlert(err,'Erro ao inserir usuário');
      });
  }

   public createAlert(mensagem: string, title: string){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: mensagem,
      buttons: ['OK']
    });
    alert.present();
  }

}
