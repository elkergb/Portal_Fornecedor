import { Component, OnInit } from '@angular/core';
import { ImportsModule } from './imports';

import { HttpClient, HttpHandler } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import * as PKG from '../../package.json'
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

import { Login } from "../objeto/app.classeLogin"

var login : any

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 15;

const TIME_LIMIT = 120;
const COLOR_CODES = {
info: {
    color: "green"
},
warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
},
alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
}
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        ImportsModule,
        NgxSpinnerModule
    ],
    providers: [
                MessageService,
    ]
})
export class AppComponent implements OnInit {
    constructor(private toastr: MessageService, private http: HttpClient, private spinner: NgxSpinnerService) {}

    Version = PKG
	c_Versao = this.Version.version

    cCodigoFornecedor : string = "000047"
    cCodigoLoja : string = "01"
    cLogin : string = ''
    cSenha : string = "EntrarAgora@2025"
    cEmail_2F : string = ""
    cAutenticacao2F : string = ""
    n2F_SegundosRestantes : number = -1

    timePassed = 0;
    timeLeft = TIME_LIMIT;
    timerInterval : any;
    remainingPathColor = COLOR_CODES.info.color;

    cNovaSenha1 : string = ""
    cNovaSenha2 : string = ""
    lSenhaDiferenteRegra : boolean = true

    ngOnInit() {
        window.sessionStorage.clear()
        window.localStorage.clear()
        login = new Login(this.http,this.toastr,this.spinner)
    }

    async validarLogin() {
        this.n2F_SegundosRestantes = -1
        this.timePassed = 0;
        this.timeLeft = TIME_LIMIT;
        this.cAutenticacao2F = ""
        
        if (this.cCodigoFornecedor.trim()!=="" && this.cCodigoLoja.trim()!=="" && this.cLogin.trim()!=="" && this.cSenha.trim()!=="") {
            this.cEmail_2F = ""
            this.cEmail_2F = await login.ClasseLogin_consultaV2(this.cCodigoFornecedor,this.cCodigoLoja,this.cLogin,this.cSenha)
            if (this.cEmail_2F.trim()!=="") {
                if (this.cEmail_2F.trim()==="reset_pss") {
                    
                }
                else {
                    this.n2F_SegundosRestantes = 1
                    window.sessionStorage.clear()
                    window.localStorage.clear()
                    this.startTimerCountDown()
                }
            }
        }
        else {
            this.toastr.add({ severity:'error',  summary:'Erro de preenchimento', detail: "Campos não preenchidos", life: 3000});
        }
    }

    async validar2F() {
        if (this.cAutenticacao2F.trim()!=="" && this.n2F_SegundosRestantes>0) {
            if (await login.ClasseLogin_consultaV3(this.cCodigoFornecedor,this.cCodigoLoja,this.cLogin,this.cSenha,this.cAutenticacao2F)==true) {
                window.sessionStorage.setItem("jsonPortalFornecedor_codigo", this.cCodigoFornecedor);
                window.sessionStorage.setItem("jsonPortalFornecedor_loja", this.cCodigoLoja);
                window.sessionStorage.setItem("jsonPortalFornecedor_login", this.cLogin);
                window.location.href = 'http://localhost:4202'
            }
            // else {
            //     this.toastr.add({ severity:'error',  summary:'Validação', detail: "2F INCORRETO", life: 3000});
            // }
        }
        else {
            this.toastr.add({ severity:'info',  summary:'Código inválido', detail: "Código digitado inválido.", life: 3000});
        }
    }

    startTimerCountDown() {
        this.timerInterval = setInterval(() => {
        this.timePassed = this.timePassed += 1;
        this.timeLeft = TIME_LIMIT - this.timePassed;
        document.getElementById("base-timer-label").innerHTML = this.formatTime(
            this.timeLeft
        );
        this.setCircleDasharray();
        this.setRemainingPathColor(this.timeLeft);
    
        if (this.timeLeft <= 0) {
            this.onTimesUp();
        }
        }, 1000);
    }

    onTimesUp() {
        clearInterval(this.timerInterval);
    }
    
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds : any = time % 60;
    
        if (seconds < 10) {
        seconds = (`0${seconds}`).toString();
        }
    
        return `${minutes}:${seconds}`;
    }
    
    setRemainingPathColor(timeLeft) {
        this.n2F_SegundosRestantes = timeLeft
        const { alert, warning, info } = COLOR_CODES;
        if (timeLeft > warning.threshold) {
                document
                    .getElementById("base-timer-path-remaining")
                    .classList.add(info.color);
                
        } else if (timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
        } else if (timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
        }
    }
    
    calculateTimeFraction() {
        const rawTimeFraction = this.timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
    }
    
    setCircleDasharray() {
        const circleDasharray = `${(
        this.calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} 283`;
        document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
    }

    testeRenovarSenha() {
        let lTemLetra : boolean = false
        let lTemLetraMaiuscula : boolean = false
        let lTemNumero : boolean = false
        let lTemEspecial : boolean = false
        let aSenha : any = this.cNovaSenha1.split('')
        let cMsgErro : string = ""
        let lTemErro : boolean = true

        this.lSenhaDiferenteRegra = true

        if (this.cNovaSenha1.trim().length<14) {
            cMsgErro = "Senha menor que 14 caracteres"
        }
        else if (this.cNovaSenha1.trim().length>30) {
            cMsgErro = "Senha maior que 30 caracteres"
        }
        else {
            for (let index=0; index<this.cNovaSenha1.trim().length; index++) {
                if (aSenha[index]===" ") {
                    cMsgErro = "Senha não pode conter ESPAÇO"
                    index = this.cNovaSenha1.length
                }
                else {
                    if (/^[a-z]+$/.test(aSenha[index])) {
                        lTemLetra = true
                    }
                    if (/^[A-Z]+$/.test(aSenha[index])) {
                        lTemLetraMaiuscula = true
                    }
                    else if (/^[0-9]+$/.test(aSenha[index])) {
                        lTemNumero = true
                    }
                    else if (/^[!@#$%&*]+$/.test(aSenha[index])) {
                        lTemEspecial = true
                    }
                }
            }

            if (cMsgErro==="") {
                if (lTemLetra==false) {
                    cMsgErro = "Senha NÃO contém ao menos 1 letra"
                }
                else if (lTemLetraMaiuscula==false) {
                    cMsgErro = "Senha NÃO contém ao menos 1 letra Maiúscula"
                }
                else if (lTemNumero==false) {
                    cMsgErro = "Senha NÃO contém ao menos 1 número"
                }
                else if (lTemEspecial==false) {
                    cMsgErro = "Senha NÃO contém ao menos 1 caractere especial"
                }
                else {
                    lTemErro = false
                }
            }
        }

        if (lTemErro==true) {
            this.lSenhaDiferenteRegra = true
            this.toastr.add({ severity:'error',  summary:'Senha incorreta', detail: cMsgErro, life: 3000});
            return
        }
        else {
            this.lSenhaDiferenteRegra = false
        }
    }

    async regravarSenhaAposReset() {
        await login.ClasseLogin_consultaV16(this.cCodigoFornecedor,this.cCodigoLoja,this.cLogin,this.cNovaSenha2)
    }
}
