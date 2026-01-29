import { Component, ElementRef, inject, Injectable,  OnInit, ViewChild, model, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, LOCALE_ID, AfterViewInit, BootstrapOptions } from '@angular/core';
import { ControlContainer, FormControl, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ImportsModule } from '../imports';
import { HttpClient } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogComponent, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { PrimeNG } from 'primeng/config';
import { Pedidos } from "../../objetos/app.pedidos"

@Component({
    providers: [DialogService, MessageService,],
    standalone:true,
    imports:[ImportsModule,
            CommonModule,
            FormsModule
    ],
    templateUrl: "./pedido_compra.html",
    styleUrl: './pedido_compra.scss',
})

export class PedidoCompra implements OnInit {
    config = inject(DynamicDialogConfig)
    private primengConfig = inject(PrimeNG);

    constructor(public ref2: DynamicDialogRef, private dialogService: DialogService,private http: HttpClient, private toastr: MessageService) {}
    
    dataSourceItemPedidoCompra : any = []

    async ngOnInit() {
        this.primengConfig.setTranslation({
            dayNames: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
            dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
            dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
            monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
            monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
            today: 'Hoje',
            clear: 'Limpar',
            weekHeader: 'Sm',
            dateFormat: 'dd/mm/yy',
            firstDayOfWeek: 0,
          });
        
        this.dataSourceItemPedidoCompra = await [...this.config.data.objeto_pedidos.buscar_itens_pedidos(this.config.data.pedido)]
    }

    cancelarEntrevistaRH() {
        this.ref2.close();
        // setTimeout(()=>{
        //     window.location.reload()
        // },1000)
    }
}