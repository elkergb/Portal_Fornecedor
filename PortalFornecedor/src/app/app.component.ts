import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ImportsModule } from './imports';
import { ConfirmationService, MegaMenuItem } from 'primeng/api';

import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

import { HttpClient, HttpHandler } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { ChangeDetectorRef } from '@angular/core';

import { PedidoCompra } from "./Dialogs/pedido_compra"
import { Acessos } from "../objetos/app.controle_acessos"
import { Pedidos } from "../objetos/app.pedidos"

var controle_acessos : any
var pedidos : any

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [ImportsModule, NgxSpinnerModule, ConfirmDialog /*PedidoCompra*/],
    encapsulation: ViewEncapsulation.None,
    providers: [
                MessageService,
			    DialogService,
                ConfirmationService
    ]
})
export class AppComponent implements OnInit {
    constructor(private toastr: MessageService,
                public dialogService: DialogService,
                private http: HttpClient,
                private cdr: ChangeDetectorRef,
                private spinner: NgxSpinnerService,
                private confirmationService: ConfirmationService) {}

    cCodigoFornecedor : string = ""
    cLojaFornecedor : string = ""
    cLoginFornecedor : string = ""
    cSenhaFornecedor : string = ""
    cNomeFornecedor : string = ""

    dataSourcePedidosCarteira : any = []
    dataSourceAlcadaAceiteNovos : any = []
    dataSourceAlcadaAceiteQuantidade : any = []
    dataSourceAlcadaAceiteValor : any = []
    dataSourceAlcadaAceiteEntrega : any = []
    dataSourceAlcadaAtrasos : any = []
    dataSourceAlcadaGravados : any = []

    n_Parametro_Porcentagem_Multa : number = 0
    n_Valor_Multa_Atraso_Entrega : number = 0
    l_Visible_AlcadaAtrasas_dialog : boolean = false
    c_AlcadaAtrasos_pedido : string = ""
    c_AlcadaAtrasos_item : string = ""
    c_AlcadaAtrasos_MotivoInformado : string = ""

    dataSourceAcessos : any = []
    dataSourceLogins : any = []
    cLogAcessosDiaSelecionado : string = ""
    dataSourceLogAcessosMensagens !: string[]
    lLogAcessosDialog : boolean = false

    lVisibleDialogIncluirLoginFornecedor : boolean = false
    lDialogDisableIncluirFornecedorBotaoSalvar : boolean = true
    n_Limite_Cadastros_Logins_Fornecedores : number = 0
    c_IncluirLogin_MensagemErro : string = ""
    c_IncluirLogin_login : string = ""
    c_IncluirLogin_nome : string = ""
    c_IncluirLogin_email : string = ""
    lNovoLoginDiferenteRegras : boolean = true
    lVisibleErroCampoEmail : boolean = true
    cCharValidEmailPadrao = /^[a-zA-Z][0-9a-zA-Z\.\-\_]+@[0-9a-zA-Z\.\-\_]+$/
    cCharValidEmailBasico = /[\w\W]+@[\w\W]+$/
    cCharValidacaoEmailEscolhida : any = this.cCharValidEmailPadrao
        /* acima na expressao regular nos temos:
                /^[a-zA-Z][0-9a-zA-Z\.\-\_]+@[0-9a-zA-Z\.\-\_]+$/
                /   é padrao do inicio da expressao regular     /  este tambem é padrao
                 ^[a-zA-Z]    indica o inicio da string o primeiro caractere sera aceito SOMENTE letras de a-z e maiúculas
                          [0-9a-zA-Z\.\-\_]+      indica que aceitara qualquer letra e numero incluindo os caracteres . - _ e o simbolo + indica em qualquer posicao
                                            @     indica que somente terá 1 simbolo @ em qualquer parte do texto
                                             [0-9a-zA-Z\.\-\_]+     sequencia de caracteres e numeros incluindo .-_ em qualquer parte do texto
                                                               $     final do texto
        */

    items: MegaMenuItem[] | undefined;
    
    cMenu_clicado : string = ""
    routeCaminhos : any | MenuItem[]
    homeCaminhos : MenuItem | undefined

    async ngOnInit() {
        console.log(window.sessionStorage.getItem("jsonPortalFornecedor_codigo"));
        console.log(window.sessionStorage.getItem("jsonPortalFornecedor_loja"));
        console.log(window.sessionStorage.getItem("jsonPortalFornecedor_login"));
        console.log(window.sessionStorage.getItem("jsonPortalFornecedor_senha"));
        this.cCodigoFornecedor = '000047'//window.sessionStorage.getItem("jsonPortalFornecedor_codigo")
        this.cLojaFornecedor = '01'//window.sessionStorage.getItem("jsonPortalFornecedor_loja")
        this.cLoginFornecedor = '087.692.456-90'//window.sessionStorage.getItem("jsonPortalFornecedor_login")
        this.cSenhaFornecedor = 'EntrarAgora@2025'//window.sessionStorage.getItem("jsonPortalFornecedor_senha")

        this.spinner.show("timer")

        await this.buscar_todas_informacoes()

        this.homeCaminhos = { icon: 'pi pi-home' };

        this.items = [
                {
                    label: 'Enviar',
                    root: true,
                    icon: 'pi pi-refresh',
                    pageHierarchy: [{label:'Enviar'}]
                },
                // {
                //     label: 'Orçamento',
                //     root: true,
                //     icon: 'pi pi-list',
                //     pageHierarchy: [{label:'Orçamento'}]
                // },
                {
                    label: 'Carteira',
                    root: true,
                    icon: 'pi pi-shopping-cart',
                    pageHierarchy: [{label:'Carteira'}]
                },
                {
                    label: 'Follow-up',
                    root: true,
                    icon: 'pi pi-thumbs-up',
                    pageHierarchy: [{label:'Follow-up'}],
                    items: [
                                [
                                    {
                                        items: [
                                            { label: 'Aceite novos', icon: 'pi pi-gift', subtext: 'Pedidos novos, aguardando aceite', valueBadge: (this.dataSourceAlcadaAceiteNovos.length==0 ? 0 : this.dataSourceAlcadaAceiteNovos[1]['alterados'].length),
                                                pageHierarchy: [{label:'Follow-up'},{label:'Aceite novos'}]
                                             },
                                        ]
                                    }
                                ],
                                [
                                    {
                                        items: [
                                            { label: 'Aceite quantidade', icon: 'pi pi-shopping-cart', subtext: 'Qtde. alterada, aguardando aceite', valueBadge: (this.dataSourceAlcadaAceiteQuantidade==0 ? 0 : this.dataSourceAlcadaAceiteQuantidade[1]['alterados'].length),
                                                pageHierarchy: [{label:'Follow-up'},{label:'Aceite quantidade'}]
                                             },
                                        ]
                                    }
                                ],
                                [
                                    {
                                        items: [
                                            { label: 'Aceite valores', icon: 'pi pi-dollar', subtext: 'Preço alterado, aguardando aceite', valueBadge: (this.dataSourceAlcadaAceiteValor==0 ? 0 : this.dataSourceAlcadaAceiteValor[1]['alterados'].length),
                                                pageHierarchy: [{label:'Follow-up'},{label:'Aceite valores'}]
                                             },
                                        ]
                                    }
                                ],
                                [
                                    {
                                        items: [
                                            { label: 'Aceite prazo', icon: 'pi pi-calendar-clock', subtext: 'Prazo alterado, aguardando aceite', valueBadge: (this.dataSourceAlcadaAceiteEntrega==0 ? 0 : this.dataSourceAlcadaAceiteEntrega[1]['alterados'].length),
                                                pageHierarchy: [{label:'Follow-up'},{label:'Aceite prazo'}]
                                             },
                                        ]
                                    }
                                ],
                                [
                                    {
                                        items: [
                                            { label: 'Com atraso', icon: 'pi pi-calendar-clock', subtext: 'Atrasados para entrega, apresentar motivos', valueBadge: (this.dataSourceAlcadaAtrasos==0 ? 0 : this.dataSourceAlcadaAtrasos[1]['atrasados'].length),
                                                pageHierarchy: [{label:'Follow-up'},{label:'Motivos Atrasos'}]
                                             },
                                        ]
                                    }
                                ]
                                // [
                                //     {
                                //         items: [{ image: 'https://primefaces.org/cdn/primeng/images/uikit/uikit-system.png', label: 'GET STARTED', subtext: 'Build spectacular apps in no time.' }]
                                //     }
                                // ]
                    ]
                },
                // {
                //     label: 'Financeiro',
                //     root: true,
                //     icon: 'pi pi-dollar',
                //     pageHierarchy: [{label:'Financeiro'}]
                // },
                {
                    label: 'Ajuda',
                    root: true,
                    icon: 'pi pi-question-circle',
                    pageHierarchy: [{label:'Ajuda'}]
                },
                {
                    label: 'Acessos',
                    root: true,
                    icon: 'pi pi-user',
                    pageHierarchy: [{label:'Histórico acessos'}]
                },
                {
                    label: 'Logins',
                    root: true,
                    icon: 'pi pi-user',
                    pageHierarchy: [{label:'Logins cadastrados'}]
                }
        ];

        if ((this.dataSourceAlcadaAtrasos==0 ? 0 : this.dataSourceAlcadaAtrasos[1]['atrasados'].length)>0) {
            for (let index=0; index<this.dataSourceAlcadaAtrasos[1]['atrasados'].length; index++) {
                if (this.dataSourceAlcadaAtrasos[1]['atrasados'][index].tem_motivo==="N") {
                    index = this.dataSourceAlcadaAtrasos[1]['atrasados'].length
                    this.confirmationService.confirm({
                        header: 'Informações sobre atrasos',
                        message: "Você possui atrasos na entrega!!!!.\nPor favor, nos apresente seus motivos para os itens em atraso (menu Follow-Up -> Com Atraso).\n (Lembrando que os atrasos serão considerados na composição das multas contratuais)",
                        accept: () => {
                            //this.toastr.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
                            console.log("Chamar POST para gravar ciente de Atrasos!!!!")
                        }
                    });
                }
            }
        }

        this.n_Parametro_Porcentagem_Multa = await pedidos.ClasseAdmin_consultaParametro("MULTA_ATRASO_ENTREGA")
        this.n_Valor_Multa_Atraso_Entrega = await pedidos.ClasseAdmin_calcularValorMulta(this.n_Parametro_Porcentagem_Multa)
        if (await pedidos.ClasseAdmin_consultaParametro("EMAIL_CHAR_SPECIAL")==="F") {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailPadrao
        }
        else {
            this.cCharValidacaoEmailEscolhida = this.cCharValidEmailBasico
        }
        this.n_Limite_Cadastros_Logins_Fornecedores = await pedidos.ClasseAdmin_consultaParametro("LIMIT_SUPPLIER")

        this.spinner.hide("timer")
    }

    async buscar_todas_informacoes() {
        await this.buscar_todos_pedidosCarteira() // DEVE ser sempre o primeiro

        this.cNomeFornecedor = await pedidos.buscar_nome_fornecedor()
        await this.buscar_todos_pedidosAlcadaNovos()
        await this.buscar_todos_pedidosAlcadaQuantidade()
        await this.buscar_todos_pedidosAlcadaValor()
        await this.buscar_todos_pedidosAlcadaEntrega()
        await this.buscar_todos_pedidosAlcadaAtrasos()
        await this.buscar_log_acessos()
        await this.buscar_logins_cadastrados()
    }

    async buscar_log_acessos() {
        controle_acessos = new Acessos(this.http,this.toastr)
        this.dataSourceAcessos = [...await controle_acessos.ClasseLogin_consultaV4(this.cCodigoFornecedor,this.cLojaFornecedor)]
    }

    async buscar_todos_pedidosCarteira() {
        pedidos = new Pedidos(this.http,this.toastr)
        // console.log("vai entrar V5")
        this.dataSourcePedidosCarteira = [...await pedidos.ClassePedidos_consultaV5(this.cCodigoFornecedor,this.cLojaFornecedor,this.cLoginFornecedor,this.cSenhaFornecedor)]
    }

    async buscar_todos_pedidosAlcadaNovos() {
        this.dataSourceAlcadaAceiteNovos = [...await pedidos.buscar_pedidos_alcada_novos()]
    }
    async buscar_todos_pedidosAlcadaQuantidade() {
        this.dataSourceAlcadaAceiteQuantidade = [...await pedidos.buscar_pedidos_alcada_quantidade()]
    }
    async buscar_todos_pedidosAlcadaValor() {
        this.dataSourceAlcadaAceiteValor = [...await pedidos.buscar_pedidos_alcada_valor()]
    }
    async buscar_todos_pedidosAlcadaEntrega() {
        this.dataSourceAlcadaAceiteEntrega = [...await pedidos.buscar_pedidos_alcada_entrega()]
    }
    async buscar_todos_pedidosAlcadaAtrasos() {
        this.dataSourceAlcadaAtrasos = [...await pedidos.buscar_pedidos_alcada_atrasos()]
    }
    async buscar_logins_cadastrados() {
        this.dataSourceLogins = [...await pedidos.buscar_logins()]
    }

    menu_clicado(_label:string,_pageHierarchy:string) {
        this.cMenu_clicado = _label
        this.routeCaminhos = [..._pageHierarchy]

        if (this.cMenu_clicado==='Enviar') {
            this.confirmationService.confirm({
                header: 'Enviar informações?',
                message: "Por favor, confirme se realmente deseja enviar as informações, sejam elas de Aceite/Recusa/Alteração.\n (estas informações somente serão processadas à noite e juntamente com análises MRP! Aguarde...)",
                accept: () => {
                    //this.toastr.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
                    console.log(this.dataSourceAlcadaGravados)
                    pedidos.ClassePedidos_consultaV14(this.cCodigoFornecedor,this.cLojaFornecedor,this.cLoginFornecedor,this.cSenhaFornecedor,this.dataSourceAlcadaGravados)
                },
                reject: () => {
                    //this.toastr.add({ severity: 'info', summary: 'Rejected', detail: 'You have rejected' });
                },
            });
        }
    }


    ref: DynamicDialogRef | undefined;
    abrirPedido(_pedido:string) {
        // this.toastr.add({ severity: 'info', summary: 'Pedido selecionado', detail: _pedido, life: 3000 });
        this.ref = this.dialogService.open(PedidoCompra, {
			header: 'Dados do pedido compra: '+_pedido,
            width: '100%',
			height: '90%',
            modal: true,
            contentStyle: { overflow: 'auto' },
            breakpoints: {
                '960px': '90%',
                '640px': '80%'
            },
			data: {
				pedido: _pedido,
                objeto_pedidos: pedidos
			}
        });

        this.ref.onClose.subscribe((dadosEntrevista: any) => {
			// console.log(dadosEntrevista)
            let summary_and_detail;
            if (dadosEntrevista) {
                // const buttonType = data?.buttonType;
                // summary_and_detail = buttonType ? { summary: 'No Product Selected', detail: `Pressed '${buttonType}' button` } : { summary: 'Product Selected', detail: data?.name };
				// summary_and_detail = { summary: 'Iniciando gravação . . .', detail: 'Botão salvar' };
				// recrutamento.gravarV4ClasseRecrutamento(dadosEntrevista)
            } else {
                summary_and_detail = { summary: 'Não foi salvo ajustes', detail: 'Botão encerramento' };
            }
            this.toastr.add({ severity: 'error', ...summary_and_detail, life: 3000 });
        });

        this.ref.onMaximize.subscribe((value) => {
            this.toastr.add({ severity: 'info', summary: 'Maximized', detail: `maximized: ${value.maximized}` });
        });
    }

    mostrarLogAcessosMensagens(_diaSelecionado:string) {
        if (this.dataSourceAcessos.length!==0) {
            this.cLogAcessosDiaSelecionado = _diaSelecionado
            this.dataSourceLogAcessosMensagens = this.dataSourceAcessos[this.dataSourceAcessos.findIndex((linha:any) => linha['dia']===_diaSelecionado)]['eventos'].reverse()
            this.lLogAcessosDialog = true
            this.cdr.detectChanges(); //chamar para atualizar na tela apos coletas
        }
    }

    comparaTexto_backgroundColor(_tituloColuna:string) {
        if (_tituloColuna.includes("Antes")) {
            return  "coral"
        }
        else if (_tituloColuna.includes("Agora")) {
            return "lightgreen"
        }
        else {
            return "transparent"
        }
    }

    alcadaPedidos_BotaoClicado(_escolhaBotao:string,_pedido:string,_item:string) {
        let dataSourceTemp : any = []
        let nIndex : number = 0
        console.log("Clicou em "+_escolhaBotao+" no pedido:"+_pedido+" com item:"+_item)

        if (this.cMenu_clicado.includes('novos')) {
            dataSourceTemp = [...this.dataSourceAlcadaAceiteNovos]
        }
        if (this.cMenu_clicado.includes('quantidade')) {
            dataSourceTemp = [...this.dataSourceAlcadaAceiteQuantidade]
        }
        else if (this.cMenu_clicado.includes('valores')) {
            dataSourceTemp = [...this.dataSourceAlcadaAceiteValor]
        }
        else if (this.cMenu_clicado.includes('prazo')) {
            dataSourceTemp = [...this.dataSourceAlcadaAceiteEntrega]
        }
        else if (this.cMenu_clicado.includes('atraso')) {
            dataSourceTemp = [...this.dataSourceAlcadaAtrasos]
        }
        
        if (dataSourceTemp.length>0) {
            console.log(dataSourceTemp)
            nIndex = dataSourceTemp[1]['alterados'].findIndex((linha:any) => linha['pedido']+linha['item']===_pedido+_item)
            console.log(dataSourceTemp[1]['alterados'][nIndex])
            
            if (nIndex>=0) {
                this.dataSourceAlcadaGravados.push({"escolha":_escolhaBotao, "pedido":_pedido, "item":_item})
                dataSourceTemp[1]['alterados'].splice(nIndex,1)

                if (this.cMenu_clicado.includes('novos')) {
                    this.dataSourceAlcadaAceiteNovos = [...dataSourceTemp]
                }
                else if (this.cMenu_clicado.includes('quantidade')) {
                    this.dataSourceAlcadaAceiteQuantidade = [...dataSourceTemp]
                }
                else if (this.cMenu_clicado.includes('valores')) {
                    this.dataSourceAlcadaAceiteValor = [...dataSourceTemp]
                }
                else if (this.cMenu_clicado.includes('prazo')) {
                    this.dataSourceAlcadaAceiteEntrega = [...dataSourceTemp]
                }
                else if (this.cMenu_clicado.includes('atraso')) {
                    this.dataSourceAlcadaAtrasos = [...dataSourceTemp]
                }
            }
        }

    }

    alcadaAtrasos_BotaoCienteClicado(_pedido:string,_item:string) {
        let dataSourceTemp : any = []
        let nIndex : number = 0
        
        this.c_AlcadaAtrasos_pedido = _pedido
        this.c_AlcadaAtrasos_item = _item

        this.l_Visible_AlcadaAtrasas_dialog = true
    }

    alcadaAtrasos_BotaoApresentarOuNaoMotivos(_pedido,_item) {
        let nPosic = this.dataSourceAlcadaAtrasos[1]['atrasados'].findIndex((linhas:any) => linhas['pedido']+linhas['item']===_pedido+_item)
        let lRetornar = true

        if (nPosic>=0) {
            if (this.dataSourceAlcadaAtrasos[1]['atrasados'][nPosic].tem_motivo==="S") {
                lRetornar = false
            }
        }

        return lRetornar
    }

    alcadaAtrasos_BotaoSalvarMotivos() {
        if (this.c_AlcadaAtrasos_pedido.trim()!=="" && this.c_AlcadaAtrasos_item.trim()!=="") {
            if (this.c_AlcadaAtrasos_MotivoInformado.trim()!=="") {
                pedidos.EnviarMotivosAtrasos(this.cCodigoFornecedor,this.cLojaFornecedor,this.cLoginFornecedor,this.cSenhaFornecedor,this.c_AlcadaAtrasos_pedido,this.c_AlcadaAtrasos_item,this.c_AlcadaAtrasos_MotivoInformado)
            }
            else {
                this.toastr.add({ severity: 'info', summary: 'Maximized', detail: 'Motivo não preenchido.' });
            }
        }
        else {
            this.toastr.add({ severity: 'info', summary: 'Maximized', detail: 'Pedido/Item não selecionado.' });
        }
    }

    async reenviarSenhaPorEmail(_recno:number) {
        await pedidos.ClassePedidos_consultaV16('reset',this.cCodigoFornecedor,this.cLojaFornecedor,this.cLoginFornecedor,this.cSenhaFornecedor,_recno)
    }

    copiarSenhaTemporariaReset(_recno:number) {
        // Copy the text inside the text field
        navigator.clipboard.writeText(pedidos.CopiarSenhaTemporaria(_recno));

        // Alert the copied text
        console.log("Copied the text: " + pedidos.CopiarSenhaTemporaria(_recno));
    }

    incluirNovoLoginFornecedor() {
        if (this.dataSourceLogins.length >= this.n_Limite_Cadastros_Logins_Fornecedores) {
            this.toastr.add({ severity:'warn',  summary:'Limite atingido', detail: "Você não pode cadastrar mais Logins!", life: 5000});
        }
        else {
            this.lVisibleDialogIncluirLoginFornecedor = true
        }
    }

    digitouCPFCompleto(){
        let _CPF_semCaracteres = this.c_IncluirLogin_login.replace(/[.-]/g,'')

        this.lNovoLoginDiferenteRegras = true
        
		// Se o CPF não tem 11 dígitos ou todos os dígitos são repetidos, o CPF é inválido
		if (_CPF_semCaracteres.length !== 11) {
			// return null
            this.c_IncluirLogin_MensagemErro = "Tamanho campo CPF menor 11 caracteres"
		}
		else if (!!_CPF_semCaracteres.match(/(\d)\1{10}/)) {
            this.toastr.add({ severity: 'error', summary: 'Erro:', detail: 'CPF inválido.' });
			this.c_IncluirLogin_login = ""
			// return false
            this.c_IncluirLogin_MensagemErro = "CPF inválido"
		}
		else {
			// Transforma de string para number[] com cada dígito sendo um número no array
			const digits = _CPF_semCaracteres.split('').map(el => +el);
			
			// Função que calcula o dígito verificador de acordo com a fórmula da Receita Federal
			function getVerifyingDigit(arr: number[]) {
				const reduced = arr.reduce( (sum, digit, index)=>(sum + digit * (arr.length - index + 1)), 0 );
				return (reduced * 10) % 11 % 10;
			}
			
			// O CPF é válido se, e somente se, os dígitos verificadores estão corretos
			if ((getVerifyingDigit(digits.slice(0, 9)) === digits[9] && getVerifyingDigit(digits.slice(0, 10)) === digits[10]) == false) {
                this.toastr.add({ severity: 'error', summary: 'Erro:', detail: 'CPF inválido.' });
				this.c_IncluirLogin_login = ""
				// return false
                this.c_IncluirLogin_MensagemErro = "CPF inválido"
			}
			else {
                this.lNovoLoginDiferenteRegras = false
                this.c_IncluirLogin_MensagemErro = ""
				// return true
			}
		}

        this.incluirFornecedorLogin_ValidarDados()
	}

    async validarEMAILDigitado() {
        if (this.cCharValidacaoEmailEscolhida.test(this.c_IncluirLogin_email)) {
            if (this.c_IncluirLogin_email.split("@").length===2) {
                this.lVisibleErroCampoEmail = false
                this.c_IncluirLogin_MensagemErro = ""
            }
        }
        else {
            this.lVisibleErroCampoEmail = true
            this.toastr.add({ severity:'warn',  summary:'Campo e-mail', detail: "Preenchimento incorreto!", life: 5000});
            this.c_IncluirLogin_MensagemErro = "E-mail com preenchimento incorreto."
        }

        this.incluirFornecedorLogin_ValidarDados()
    }

    incluirFornecedorLogin_ValidarDados() {
        let lPassouNaValidacao : boolean = true

        this.lDialogDisableIncluirFornecedorBotaoSalvar = true

        if (this.lVisibleErroCampoEmail==false && this.lNovoLoginDiferenteRegras==false && this.c_IncluirLogin_nome.trim()!=='') {
            for (let index=0; index<this.dataSourceLogins.length; index++) {
                if (this.dataSourceLogins[index]['login'].trim()===this.c_IncluirLogin_login.trim()) {
                    this.toastr.add({ severity:'warn',  summary:'Inclusão não permitida', detail: "Login já existente", life: 5000});
                    lPassouNaValidacao = false
                    index = this.dataSourceLogins.length
                    this.c_IncluirLogin_MensagemErro = "Login já existente"
                }
                else if (this.dataSourceLogins[index]['email'].trim()===this.c_IncluirLogin_email.trim()) {
                    this.toastr.add({ severity:'warn',  summary:'Inclusão não permitida', detail: "E-mail já existente", life: 5000});
                    lPassouNaValidacao = false
                    index = this.dataSourceLogins.length
                    this.c_IncluirLogin_MensagemErro = "E-mail já existente"
                }
            }

            if (lPassouNaValidacao==true) {
                this.c_IncluirLogin_MensagemErro = ""
                this.lDialogDisableIncluirFornecedorBotaoSalvar = false
            }
        }
        else {
            this.c_IncluirLogin_MensagemErro = "Compos não preenchidos corretamente"
        }
    }

    async incluirNovoLoginFornecedor_salvar() {
        this.spinner.show("timer")
        await pedidos.ClassePedidos_consultaV17("incluir",this.cCodigoFornecedor,this.cLojaFornecedor,this.cNomeFornecedor,this.cLoginFornecedor,this.cSenhaFornecedor,this.c_IncluirLogin_login,this.c_IncluirLogin_nome,this.c_IncluirLogin_email,0)
        await this.buscar_todas_informacoes()
        this.lVisibleDialogIncluirLoginFornecedor = false
        this.spinner.hide("timer")
    }

    incluirNovoLoginFornecedor_cancel() {
        this.lVisibleDialogIncluirLoginFornecedor = false
    }

    async deletarLoginFornecedor(_recno:number) {
        this.spinner.show("timer")
        await pedidos.ClassePedidos_consultaV17("deletar",this.cCodigoFornecedor,this.cLojaFornecedor,"",this.cLoginFornecedor,this.cSenhaFornecedor,"","","",_recno)
        await this.buscar_todas_informacoes()
        this.spinner.hide("timer")
    }
}