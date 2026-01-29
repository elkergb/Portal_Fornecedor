import { booleanAttribute, Component, OnInit } from '@angular/core';
import { ImportsModule } from './imports';

import { HttpClient, HttpHandler } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import * as PKG from '../../package.json'
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

import { Admin } from "../objeto/app.classeAdmin"
import { UploadEvent } from 'primeng/fileupload';

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
                ConfirmationService,
    ]
})
export class AppComponent implements OnInit {
    constructor(private toastr: MessageService, private http: HttpClient, private spinner: NgxSpinnerService, private confirmationService: ConfirmationService) {}

    Version = PKG
	c_Versao = this.Version.version

    cChaveAcesso : string = ""
    lChaveAcessoVisible : boolean = false
    cCNPJ : string = "21.433.547/0001-50"
    lCNPJDisable : boolean = false
    cLogin : string = "087.692.456-90"
    lLoginDisable : boolean = false
    lCampoSenhaVisible : boolean = false
    cSenha : string = "EntrarAgora@2025"
    cEmail_2F : string = ""
    cAutenticacao2F : string = ""
    n2F_SegundosRestantes : number = -1
    lBotoesVisible : boolean = false
    lBotaoRenovarSenha : boolean = false
    lLoginSucesso : boolean = true // VOLTAR ANTES IR PARA PRODUCAO
    n_QtdColunasArquivoImportacao : number = 14  // quantidade de colunas dentro arquivo importacao da carga de PC

    timePassed = 0;
    timeLeft = TIME_LIMIT;
    timerInterval : any;
    remainingPathColor = COLOR_CODES.info.color;

    aFornecedor : any = []
    selectedFornecedor : any = null
    aCliente : any = []
    selectedCliente : any = null
    aParametro : any = []
    selectedParametro : any = null

    aCarteiraGeral : any = []
    aCarteiraGeralFiltrada : any = []
    n_CarteiraGeralFiltrada_Qtde = 0
    n_CarteiraGeralFiltrada_Quje = 0
    n_CarteiraGeralFiltrada_Saldo = 0
    n_CarteiraGeralFiltrada_Total = 0
    a_TipoMaterial : any = ['Todos','Produtivo','Comum']
    c_TipoMaterial = "Todos"

    lVisibleErroCampoEmail : boolean = false
    cCharValidEmailPadrao = /^[a-zA-Z][0-9a-zA-Z\.\-\_]+@[0-9a-zA-Z\.\-\_]+$/
    cCharValidEmailBasico = /[\w\W]+@[\w\W]+$/
    cCharValidacaoEmailEscolhida
        /* acima na expressao regular nos temos:
                /^[a-zA-Z][0-9a-zA-Z\.\-\_]+@[0-9a-zA-Z\.\-\_]+$/
                /   é padrao do inicio da expressao regular     /  este tambem é padrao
                 ^[a-zA-Z]    indica o inicio da string o primeiro caractere sera aceito SOMENTE letras de a-z e maiúculas
                          [0-9a-zA-Z\.\-\_]+      indica que aceitara qualquer letra e numero incluindo os caracteres . - _ e o simbolo + indica em qualquer posicao
                                            @     indica que somente terá 1 simbolo @ em qualquer parte do texto
                                             [0-9a-zA-Z\.\-\_]+     sequencia de caracteres e numeros incluindo .-_ em qualquer parte do texto
                                                               $     final do texto
        */

    lVisibleDialogIncluirFornecedor : boolean = false
    lDisableSalvarDialogIncluirFornecedor : boolean = true
    lDialogIncluirFornecedorModoEdicao : boolean = false
    lDialogIncluirFornecedorModoEdicaoCampoNome : boolean = false
    cFornecedor_recno : string = ""
    cFornecedor_codigo : string = ""
    cFornecedor_loja : string = ""
    cFornecedor_nome : string = ""
    cFornecedor_login : string = ""
    cFornecedor_contato : string = ""
    cFornecedor_email : string = ""

    lVisibleDialogIncluirCliente : boolean = false
    lDisableSalvarDialogIncluirCliente : boolean = true
    lDialogIncluirClienteModoEdicao : boolean = false
    cCliente_recno : string = ""
    cCliente_login : string = ""
    cCliente_email : string = ""

    lVisibleDialogAlterarParametro : boolean = false
    lDisableSalvarDialogAlterarParametro : boolean = false
    cParametro_recno : string = ""
    cParametro_chave : string = ""
    cParametro_descritivo : string = ""
    cParametro_contem : string = ""
    cParametro_aceitavel : string = ""

    fileImportCSV : string = ''
    fileImportArray : any = []

    async ngOnInit() {
        window.sessionStorage.clear()
        window.localStorage.clear()
        login = new Admin(this.http,this.toastr,this.spinner)

        await this.buscarDados() // REMOVER ANTES DE IR PARA PRODUCAO
    }

    async buscarDados() {
        await login.ClasseAdmin_consultaV8(this.cCNPJ,this.cLogin,this.cSenha)
        this.aFornecedor =  await login.ClasseAdmin_buscarFornecedor()
        this.aCliente =  await login.ClasseAdmin_buscarCliente()
        this.aParametro =  await login.ClasseAdmin_buscarParametroUser()
        this.aCarteiraGeral = await login.ClasseAdmin_buscarCarteiraGeral()

        console.log(this.aFornecedor)
        console.log(this.aCliente)
        console.log(this.aParametro)
        console.log(this.aCarteiraGeral)
    }

    async validarLogin() {
        this.n2F_SegundosRestantes = -1
        this.timePassed = 0;
        this.timeLeft = TIME_LIMIT;
        this.cAutenticacao2F = ""
        
        if (this.cCNPJ.trim()!=="" && this.cLogin.trim()!=="" && this.cSenha.trim()!=="") {
            this.cEmail_2F = ""
            this.cEmail_2F = await login.ClasseAdmin_consultaV2(this.cCNPJ,this.cLogin,this.cSenha)
            if (this.cEmail_2F.trim()!="") {
                this.n2F_SegundosRestantes = 1
                window.sessionStorage.clear()
                window.localStorage.clear()
                this.startTimerCountDown()
            }
        }
        else {
            this.toastr.add({ severity:'error',  summary:'Erro de preenchimento', detail: "Campos não preenchidos", life: 3000});
        }
    }

    async validar2F() {
        if (this.cAutenticacao2F.trim()!=="" && this.n2F_SegundosRestantes>0) {
            if (await login.ClasseAdmin_consultaV3(this.cCNPJ,this.cLogin,this.cSenha,this.cAutenticacao2F)==true) {
                this.lLoginSucesso = true
                this.aFornecedor = await login.ClasseAdmin_consultaV8(this.cCNPJ,this.cLogin,this.cSenha)
            }
            // else {
            //     this.toastr.add({ severity:'error',  summary:'Validação', detail: "2F INCORRETO", life: 3000});
            // }
        }
        else {
            this.toastr.add({ severity:'info',  summary:'Validade código expirada', detail: "Foi enviado novo e-mail com novo código.", life: 3000});
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

    async checarPreenchimento_login() {
        let retorno = ""
        this.lCampoSenhaVisible = false
        this.lChaveAcessoVisible = false
        this.lBotoesVisible = false
        this.lBotaoRenovarSenha = false

        if (this.cCNPJ.trim()!=="" && this.cLogin.trim()!=="") {
            retorno = (await login.ClasseAdmin_consultaV6(this.cCNPJ,this.cLogin))['retorno']
            if (retorno==="Renovar") {
                this.lCampoSenhaVisible = true
                this.lChaveAcessoVisible = true
                this.lBotoesVisible = true
                this.lBotaoRenovarSenha = true
                this.lCNPJDisable = true
                this.lLoginDisable = true
            }
            else if (retorno==="Liberar") {
                this.lCampoSenhaVisible = true
                this.lBotoesVisible = true
                this.lCNPJDisable = true
                this.lLoginDisable = true
            }
        }
    }

    async renovarSenha() {
        let lTemLetra : boolean = false
        let lTemNumero : boolean = false
        let lTemEspecial : boolean = false
        let aSenha : any = this.cSenha.split('')
        let cMsgErro : string = ""
        let lTemErro : boolean = true

        if (this.cSenha.trim()==="") {
            cMsgErro = "Senha vazia"
        }
        else if (this.cSenha.trim().length<14) {
            cMsgErro = "Senha menor que 14 caracteres"
        }
        else if (this.cSenha.trim().length>30) {
            cMsgErro = "Senha maior que 30 caracteres"
        }
        else {
            for (let index=0; index<this.cSenha.trim().length; index++) {
                if (aSenha[index]===" ") {
                    cMsgErro = "Senha não pode conter ESPAÇO"
                    index = this.cSenha.length
                }
                else {
                    if (/^[a-zA-Z]+$/.test(aSenha[index])) {
                        lTemLetra = true
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
            this.toastr.add({ severity:'error',  summary:'Senha incorreta', detail: cMsgErro, life: 3000});
            return
        }
        else {
            if ((await login.ClasseAdmin_consultaV7(this.cCNPJ,this.cLogin,this.cChaveAcesso,this.cSenha))==true) {
                setTimeout(() => { window.location.reload() }, 3000);
            }
        }        
    }


    // ABA FORNECEDOR
    incluirFornecedor() {
        this.lVisibleDialogIncluirFornecedor = true
        this.lDisableSalvarDialogIncluirFornecedor = true
    }

    async incluirFornecedor_checkDuplicidade() {
        if (this.lDialogIncluirFornecedorModoEdicao!==true) {
            this.lDisableSalvarDialogIncluirFornecedor = true

            if (this.cFornecedor_codigo.trim()!=="" && this.cFornecedor_loja.trim()!=="") {
                let nPosic = this.aFornecedor.findIndex((linha:any) => linha['codigo']+linha['loja']===this.cFornecedor_codigo.trim()+this.cFornecedor_loja.trim())
                if (nPosic>=0) {
                    this.cFornecedor_nome = this.aFornecedor[nPosic]['nome']
                    this.lDialogIncluirFornecedorModoEdicaoCampoNome = true
                }
                else {
                    this.lDialogIncluirFornecedorModoEdicaoCampoNome = false
                }
            }

            if (this.cFornecedor_codigo.trim()!=="" && this.cFornecedor_loja.trim()!=="" && this.cFornecedor_login.trim()!=="" && this.cFornecedor_email.trim()!=="") {
                if (this.aFornecedor.findIndex((linha:any) => linha['codigo']+linha['loja']+linha['login']===this.cFornecedor_codigo+this.cFornecedor_loja+this.cFornecedor_login) >= 0) {
                    this.toastr.add({ severity:'warn',  summary:'Registro duplicado', detail: "Código+Loja+Login já existe!", life: 5000});
                }
                else {
                    if (this.aFornecedor.filter((linhas:any) => linhas['codigo']+linhas['loja']===this.cFornecedor_codigo+this.cFornecedor_loja).length >= await login.ClasseAdmin_consultaParametroSystem("LIMIT_SUPPLIER")) {
                        this.toastr.add({ severity:'info',  summary:'Operação não permitida', detail: "Limite de cadastros por Fornecedor atingido!", life: 5000});
                    }
                    // >>>>>>  >>>>>>>> (VERIFICAR SIZE COMPARA E RETORNA T/F e NAO NUMERO
                    else if (new Set(this.aFornecedor.map((x:any) => x.codigo+x.loja)).size >= await login.ClasseAdmin_consultaParametroSystem("LIMIT_SUPPLIER_ALL")
                            && this.aFornecedor.filter((linhas:any) => linhas['codigo']+linhas['loja']===this.cFornecedor_codigo+this.cFornecedor_loja).length == 0) {
                        this.toastr.add({ severity:'info',  summary:'Operação não permitida', detail: "Limite de cadastros gerais atingido!", life: 5000});
                    }
                    else {
                        this.lDisableSalvarDialogIncluirFornecedor = false
                    }
                }
            }
        }
        else {
            this.lDisableSalvarDialogIncluirFornecedor = false
        }
    }
    incluirFornecedor_checkEmail() {
        let lPassouValidacaoEmail = false
        
        if (this.aParametro[this.aParametro.findIndex((linhas:any) => linhas['chave'].trim()==='EMAIL_CHAR_SPECIAL')]['contem']==="F") {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailPadrao
        }
        else {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailBasico
        }

        if (this.cCharValidacaoEmailEscolhida.test(this.cFornecedor_email)) {
            if (this.cFornecedor_email.split("@").length===2) {
                this.lVisibleErroCampoEmail = false
                this.incluirFornecedor_checkDuplicidade()
            }
            else {
                this.lDisableSalvarDialogIncluirFornecedor = true
            }
        }
        else {
            this.lDisableSalvarDialogIncluirFornecedor = true
            this.lVisibleErroCampoEmail = true
            this.toastr.add({ severity:'warn',  summary:'Campo e-mail', detail: "Preenchimento incorreto!", life: 5000});
        }
    }
    incluirFornecedor_save() {
        login.ClasseAdmin_inserirFornecedor(this.cFornecedor_codigo,this.cFornecedor_loja,this.cFornecedor_nome,this.cFornecedor_login,this.cFornecedor_contato,this.cFornecedor_email)
        this.lVisibleDialogIncluirFornecedor = false
    }
    incluirFornecedor_cancel() {
        this.lVisibleDialogIncluirFornecedor = false
        this.lDialogIncluirFornecedorModoEdicao = false
    }
    async incluirFornecedor_enviarPOST() {
        await login.ClasseAdmin_consultaV9(this.cCNPJ,this.cLogin,this.cSenha)
        window.location.reload()
    }

    alterarFornecedor(_recno:string) {
        this.lDisableSalvarDialogIncluirFornecedor = true

        let nPosic = this.aFornecedor.findIndex((linhas:any) => linhas['recno']===_recno)

        this.cFornecedor_recno = nPosic

        if (nPosic>=0) {
            this.lVisibleDialogIncluirFornecedor = true
            this.lDialogIncluirFornecedorModoEdicao = true
            this.cFornecedor_codigo = this.aFornecedor[nPosic]['codigo']
            this.cFornecedor_loja = this.aFornecedor[nPosic]['loja']
            this.cFornecedor_nome = this.aFornecedor[nPosic]['nome']
            this.cFornecedor_login = this.aFornecedor[nPosic]['login']
            this.cFornecedor_contato = this.aFornecedor[nPosic]['contato'].trim()
            this.cFornecedor_email = this.aFornecedor[nPosic]['email'].trim()
        }
    }

    async alterarFornecedor_save() {
        this.aFornecedor = await login.ClasseAdmin_alterarFornecedor(this.cFornecedor_recno,this.cFornecedor_contato,this.cFornecedor_email,this.cFornecedor_nome)
        
        this.lVisibleDialogIncluirFornecedor = false
        this.lDialogIncluirFornecedorModoEdicao = false
    }

    async excluirFornecedor(_recno:string) {
        let nPosic = this.aFornecedor.findIndex((linhas:any) => linhas['recno']===_recno)
        if (nPosic>=0) {
            let _fornecedor = this.aFornecedor[nPosic]['codigo']+'/'+this.aFornecedor[nPosic]['loja']
            let _contato = this.aFornecedor[nPosic]['contato']
            this.confirmationService.confirm({
                header: 'Exclusão cadastro',
                message: 'Fornecedor '+_fornecedor+' Contato: '+_contato,
                accept: async () => {
                    this.aFornecedor = await login.ClasseAdmin_excluirFornecedor(_recno)
                },
                reject: () => {
                    // this.toastr.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected' });
                },
            });
        }
    }


    // ABA CLIENTE
    async incluirCliente() {
        this.lDisableSalvarDialogIncluirCliente = true
        if (this.aCliente.length < await login.ClasseAdmin_consultaParametroSystem('LIMIT_CUSTOMER')) {
            this.lVisibleDialogIncluirCliente = true
            this.cCliente_login = ""
            this.cCliente_email = ""
            this.lVisibleErroCampoEmail = true
        }
        else {
            this.toastr.add({ severity:'info',  summary:'Operação não permitida', detail: "Limite de cadastros atingido!", life: 5000});
        }
    }

    incluirCliente_checkDuplicidade() {
        if (this.lDialogIncluirClienteModoEdicao!==true) {
            this.lDisableSalvarDialogIncluirCliente = true

            if (this.cCliente_login.trim()!=="" && this.lVisibleErroCampoEmail==false) {
                if (this.aCliente.findIndex((linha:any) => linha['login']===this.cCliente_login) >= 0) {
                    this.toastr.add({ severity:'warn',  summary:'Registro duplicado', detail: "Login já existe!", life: 5000});
                }
                else {
                    this.lDisableSalvarDialogIncluirCliente = false
                }
            }
        }
        else {
            this.lDisableSalvarDialogIncluirCliente = false
        }
    }
    incluirCliente_checkEmail() {
        let lPassouValidacaoEmail = false
        
        if (this.aParametro[this.aParametro.findIndex((linhas:any) => linhas['chave'].trim()==='EMAIL_CHAR_SPECIAL')]['contem']==="F") {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailPadrao
        }
        else {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailBasico
        }

        if (this.cCharValidacaoEmailEscolhida.test(this.cCliente_email)) {
            if (this.cCliente_email.split("@").length===2) {
                this.lVisibleErroCampoEmail = false
                this.incluirCliente_checkDuplicidade()
            }
            else {
                this.lDisableSalvarDialogIncluirCliente = true
            }
        }
        else {
            this.lDisableSalvarDialogIncluirCliente = true
            this.lVisibleErroCampoEmail = true
            this.toastr.add({ severity:'warn',  summary:'Campo e-mail', detail: "Preenchimento incorreto!", life: 5000});
        }
    }
    incluirCliente_save() {
        login.ClasseAdmin_inserirCliente(this.cCliente_login,this.cCliente_email)
        this.lVisibleDialogIncluirCliente = false
    }
    incluirCliente_cancel() {
        this.lVisibleDialogIncluirCliente = false
        this.lDialogIncluirClienteModoEdicao = false
    }
    async incluirCliente_enviarPOST() {
        await login.ClasseAdmin_consultaV10(this.cCNPJ,this.cLogin,this.cSenha)
        await this.buscarDados()
    }

    alterarCliente(_recno:string) {
        let nPosic = this.aCliente.findIndex((linhas:any) => linhas['recno']===_recno)

        this.cCliente_recno = nPosic

        if (nPosic>=0) {
            this.lVisibleDialogIncluirCliente = true
            this.lDialogIncluirClienteModoEdicao = true
            this.cCliente_login = this.aCliente[nPosic]['login']
            this.cCliente_email = this.aCliente[nPosic]['email'].trim()
        }
    }

    async alterarCliente_save() {
        this.aCliente = await login.ClasseAdmin_alterarCliente(this.cCliente_recno,this.cCliente_login,this.cCliente_email)
        
        this.lVisibleDialogIncluirCliente = false
        this.lDialogIncluirClienteModoEdicao = false
    }

    async excluirCliente(_recno:string) {
        let nPosic = this.aCliente.findIndex((linhas:any) => linhas['recno']===_recno)
        if (nPosic>=0) {
            let _login = this.aCliente[nPosic]['login']
            this.confirmationService.confirm({
                header: 'Exclusão cadastro',
                message: 'Login '+_login,
                accept: async () => {
                    this.aCliente = await login.ClasseAdmin_excluirCliente(_recno)
                },
                reject: () => {
                    // this.toastr.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected' });
                },
            });
        }
    }

    async enviarChaveCliente(_recno:string) {
        await login.ClasseAdmin_enviarChaveClienteV11(this.cCNPJ,this.cLogin,this.cSenha,_recno)
    }



    alterarParametro(_recno:string) {
        let nPosic = this.aParametro.findIndex((linhas:any) => linhas['recno']===_recno)

        this.cParametro_recno = nPosic

        if (nPosic>=0) {
            this.lVisibleDialogAlterarParametro = true
            this.cParametro_chave = this.aParametro[nPosic]['chave'].trim()
            this.cParametro_descritivo = this.aParametro[nPosic]['descritivo'].trim()
            this.cParametro_contem = this.aParametro[nPosic]['contem'].trim()
            this.cParametro_aceitavel = this.aParametro[nPosic]['aceitavel'].trim()
        }
    }
    alterarParametro_checkConteudo() {
        if (this.cParametro_contem.trim()!=="") {
            this.lDisableSalvarDialogAlterarParametro = false
        }
        else {
            this.lDisableSalvarDialogAlterarParametro = true
        }
    }
    async alterarParametro_save() {
        this.aParametro = await login.ClasseAdmin_alterarParametro(this.cParametro_recno,this.cParametro_contem)
        
        this.lVisibleDialogAlterarParametro = false
    }
    alterarParametro_cancel() {
        this.lVisibleDialogAlterarParametro = false
    }
   async alterarParametro_enviarPOST() {
        if (await login.ClasseAdmin_consultaV12(this.cCNPJ,this.cLogin,this.cSenha)==true) {
            await this.buscarDados()
        }
    }


    // rotina de leitura do arquivo Carteira de Pedidos importada
    onFileSelect(event: any) {
        if (event.files && event.files.length > 0) {
            const file: File = event.files[0];
            const reader = new FileReader();

            reader.onload = (e: any) => {
                this.fileImportCSV = e.target.result;
                // console.log('File content:', this.fileImportCSV);
                this.fileImportArray = this.fileImportCSV.split("\r\n").map(value => value.trim().split("|").map(value => value))
                // console.log("trabalhou")
            };

            reader.onloadend = async (e:any) => {
                // console.log("Uploadded")
                let lcontinuar = true

                if (this.fileImportArray.length>1) {
                    let nPosicFornecedor = 1
                    let nPosicLoja = 2
                    let nPosicPedido = 3
                    let nPosicItem = 4

                    for (let index=0; index+1<this.fileImportArray.length; index++) {
                        if (this.fileImportArray[index].length!==this.n_QtdColunasArquivoImportacao) {
                            this.toastr.add({ severity:'warn',  summary:'Importação', detail: "Abortada, erro linha "+(index+1).toString()+"!", life: 10000});
                            lcontinuar = false
                        }
                        else if (this.fileImportArray.filter((linhas:any) => linhas[nPosicFornecedor]+linhas[nPosicLoja]+linhas[nPosicPedido]+linhas[nPosicItem] === this.fileImportArray[index][nPosicFornecedor]+this.fileImportArray[index][nPosicLoja]+this.fileImportArray[index][nPosicPedido]+this.fileImportArray[index][nPosicItem]).length > 1) {
                            this.toastr.add({ severity:'warn',  summary:'Importação', detail: "Abortada, linha duplicada "+(index+1).toString()+"!", life: 10000});
                            lcontinuar = false
                        }
                    }
                }
                else {
                    this.toastr.add({ severity:'warn',  summary:'Importação', detail: "Abortada, arquivo vazio!", life: 3000});
                    this.fileImportCSV = ""
                    this.fileImportArray = []
                    lcontinuar = false
                }

                if (lcontinuar==true) {
                    await login.ClasseAdmin_consultaV13(this.cCNPJ,this.cLogin,this.cSenha,this.fileImportArray)
                }
            }

            reader.readAsText(file); // Or reader.readAsDataURL(file) for images/binary

        }
        console.log(this.fileImportArray)
    }

    onFilterCarteiraGeral(event : any) {
        this.aCarteiraGeralFiltrada = event.filteredValue;

        this.n_CarteiraGeralFiltrada_Qtde = this.aCarteiraGeralFiltrada.reduce((sum, item) => sum+item.quantidade, 0)
        this.n_CarteiraGeralFiltrada_Quje = this.aCarteiraGeralFiltrada.reduce((sum, item) => sum+item.qtde_entregue, 0)
        this.n_CarteiraGeralFiltrada_Saldo = this.aCarteiraGeralFiltrada.reduce((sum, item) => sum+item.saldo, 0)
        this.n_CarteiraGeralFiltrada_Total = this.aCarteiraGeralFiltrada.reduce((sum, item) => sum+item.total, 0)
    }

    totalizadorCarteiraGeral_Total() {
        return this.aCarteiraGeral.reduce((sum, item) => sum+item.total, 0)
    }

    async filtrarMaterial() {
        this.aCarteiraGeral = [...await login.ClasseAdmin_filtrarTipoMaterial(this.c_TipoMaterial)]
    }
}