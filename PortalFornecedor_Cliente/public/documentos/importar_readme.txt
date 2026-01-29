   (TEXTO SOMENTE PARA DEVs) alterando este tamanho de parâmetro, em outros ERP ou eventualmente saindo do tamanho 6 para 7, deveria também rodar no SQL um ALTER TABLE nesta coluna específica


O modelo de arquivo disponibilizado para utilização da importação de Carteira de Pedidos deverá contemplar as seguintes lógicas/estruturas:

1) coluna "fornecedor"
   devera conter o código do fornecedor, (DESCONSIDERADO) podendo ou não ser omitido os zeros à esquerda a rotina irá trabalhar complementando com zeros à esquerda até o tamanho total indicado no parâmetro "TAB_ORDER_CODE_SUPPL"


2) coluna "loja"
   devera conter o código da loja/filial, (DESCONSIDERADO) podendo ou não ser omitido os zeros à esquerda a rotina irá trabalhar complementando com zeros à esquerda até o tamanho total indicado no parâmetro "TAB_ORDER_BRANCH"

3) coluna "pedido"
   devera conter o código do pedido de compras, (DESCONSIDERADO) podendo ou não ser omitido os zeros à esquerda a rotina irá trabalhar complementando com zeros à esquerda até o tamanho total indicado no parâmetro "TAB_ORDER_ORDER"

4) coluna "item"
   devera conter o item do pedido de compras, (DESCONSIDERADO) podendo ou não ser omitido os zeros à esquerda a rotina irá trabalhar complementando com zeros à esquerda até o tamanho total indicado no parâmetro "TAB_ORDER_ITEM"

5) coluna "produto"
   devera conter o código do produto, (DESCONSIDERADO) para este campo a rotina possui o parâmetro "TAB_ORDER_PRODUCT"

6) coluna "descrição"
   devera conter a descrição do produto, sem acentos. Para este campo a rotina possui o parâmetro "TAB_ORDER_UP_DESC" cujo conteúdo é True/False fazendo com que o descritivo ao ser dado carga seja transcrito totalmente para MAIUSCULO

7) coluna "quantidade"
   contem a quantidade do item no pedido. Este campo somente poderá conter a formatação 999999999,99 (dependendo dos parâmetros a seguir).
   Para este campo a rotina possui o parâmetro "TAB_ORDER_DEC_QTDE" cujo conteúdo deverá conter a quantidade de casas decimais habilitadas no campo quantidade.
   Ainda para este campo a rotina possui outro parâmetro "TAB_ORDER_THOUSAN" cujo conteúdo deverá conter o separador de milhar (. ou ,)

8) coluna "qtde_entregue"
   devera conter a quantidade já entregue do item em questão, seguirá as mesmas parametrizações do campo "quantidade"

9) coluna "vlr_unit"
   devera conter o valor unitário do item, para este campo a rotina possui o parâmetro "TAB_ORDER_DEC_PRUNIT" cujo conteúdo deverá conter a quantidade de casas decimais habilitadas no campo Preço Unitário

10) coluna "vlr_total"
   devera conter o valor total do item, para este campo a rotina possui o parâmetro "TAB_ORDER_DEC_PRTOT" cujo conteúdo deverá conter a quantidade de casas decimais habilitadas no campo Preço Total

11) coluna "ipi_porcent"
   devera conter o valor em porcentagem "%" do IPI, para este campo a rotina possui o parâmetro "TAB_ORDER_DEC_IPI" cujo conteúdo deverá conter a quantidade de casas decimais habilitadas no campo Porcentagem IPI

12) coluna "data entrega"
   devera conter a data de entrega do item, somente contendo números, neste caso há o parâmetro "TAB_ORDER_DATE" cujo conteúdo poderá ser os formatos: DDMMAAAA | MMDDAAAA | AAAAMMDD

13) coluna "data emissao"
   devera conter a data de emissao do pedido de compras