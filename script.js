let graficoGastosLucro; // Variável global para o gráfico de gastos e lucro
let graficoDeducoes; // Variável global para o gráfico de deduções

// Função para alternar entre modo escuro e claro
const toggleModo = document.getElementById('toggleModo');
const body = document.body;

toggleModo.addEventListener('click', () => {
    body.classList.toggle('modo-escuro');
});

// Modo escuro automático
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDarkMode) {
    body.classList.add('modo-escuro');
}

// Validação em tempo real
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value < 0) {
            this.style.borderColor = 'red';
            alert('O valor não pode ser negativo.');
        } else {
            this.style.borderColor = '#ccc';
        }
    });
});

// Função para calcular o preço
function calcularPreco() {
    // Mostra o loading
    document.getElementById('loading').style.display = 'flex';

    setTimeout(() => {
        // Captura dos valores obrigatórios
        const custo = parseFloat(document.getElementById('custo').value);
        const precoVenda = parseFloat(document.getElementById('precoVenda').value);

        // Validação dos campos obrigatórios
        if (isNaN(custo) || isNaN(precoVenda)) {
            alert("⚠️ Por favor, preencha os campos obrigatórios: Custo do Produto e Preço de Venda.");
            document.getElementById('loading').style.display = 'none';
            return; // Interrompe a função se os campos estiverem vazios
        }

        // Captura dos demais valores (opcionais)
        const impostos = parseFloat(document.getElementById('impostos').value) || 0;
        const taxaCartao = parseFloat(document.getElementById('taxaCartao').value) || 0;
        const comissaoPlataforma = parseFloat(document.getElementById('comissaoPlataforma').value) || 0;
        const marketing = parseFloat(document.getElementById('marketing').value) || 0;
        const comissaoVendedor = parseFloat(document.getElementById('comissaoVendedor').value) || 0;
        const outrasDeducoes = parseFloat(document.getElementById('outrasDeducoes').value) || 0;
        const custoVenda = parseFloat(document.getElementById('custoVenda').value) || 0;
        const embalagem = parseFloat(document.getElementById('embalagem').value) || 0;
        const frete = parseFloat(document.getElementById('frete').value) || 0;
        const outrosInsumos = parseFloat(document.getElementById('outrosInsumos').value) || 0;

        // Cálculos
        const deducoesPercentuais = precoVenda * (impostos + taxaCartao + comissaoPlataforma + marketing + comissaoVendedor + outrasDeducoes) / 100;
        const deducoesReais = custoVenda + embalagem + frete + outrosInsumos;
        const totalDeducoes = deducoesPercentuais + deducoesReais;
        const lucroBruto = precoVenda - custo;

        // Margem de Contribuição corrigida
        const margemContribuicao = precoVenda - custo - totalDeducoes;

        // Defina uma margem mínima desejada (exemplo: 40%)
        const margemMinimaDesejada = 40; // Em porcentagem

        // Cálculo do preço de venda mínimo para atingir a margem mínima
        const precoMinimo = (custo + deducoesReais) / (1 - (margemMinimaDesejada / 100 + (impostos + taxaCartao + comissaoPlataforma + marketing + comissaoVendedor + outrasDeducoes) / 100));

        // Exibição do resultado em Cards
        document.getElementById('precoVendaResultado').textContent = `R$ ${precoVenda.toFixed(2)}`;
        document.getElementById('lucroBrutoResultado').textContent = `R$ ${lucroBruto.toFixed(2)}`;
        document.getElementById('deducoesResultado').textContent = `R$ ${totalDeducoes.toFixed(2)}`;
        document.getElementById('margemContribuicaoResultado').textContent = `R$ ${margemContribuicao.toFixed(2)}`;

        // Barra de Progresso
        const progressoMargem = (margemContribuicao / precoVenda) * 100;
        const progressoMinimo = margemMinimaDesejada;

        const progressoMargemElement = document.getElementById('progressoMargem');
        const textoProgressoElement = document.getElementById('textoProgresso');
        const avisoProgressoElement = document.getElementById('avisoProgresso');

        progressoMargemElement.style.width = `${Math.min(progressoMargem, 100)}%`;
        textoProgressoElement.textContent = `${Math.min(progressoMargem, 100).toFixed(2)}%`;

        // Verifica se a margem está abaixo do mínimo
        if (progressoMargem < progressoMinimo) {
            progressoMargemElement.style.backgroundColor = '#FF6384'; // Cor vermelha
            avisoProgressoElement.innerHTML = `
                <div class="aviso">
                    ⚠️ <strong>Atenção!</strong> A margem de contribuição está abaixo do mínimo desejado (${margemMinimaDesejada}%).<br>
                    Sugerimos aumentar o preço para pelo menos <strong>R$ ${precoMinimo.toFixed(2)}</strong>.
                    <button onclick="ajustarPreco()">Ajustar Preço</button>
                </div>
            `;
        } else {
            progressoMargemElement.style.backgroundColor = '#28a745'; // Cor verde
            avisoProgressoElement.innerHTML = ''; // Remove o aviso
        }

        // Dados para o gráfico de gastos e lucro
        const dadosGastosLucro = {
            labels: ['Custo do Produto', 'Deduções Totais', 'Lucro Bruto'],
            datasets: [{
                label: 'Valores em R$',
                data: [custo, totalDeducoes, lucroBruto],
                backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0'],
                borderColor: ['#FF6384', '#36A2EB', '#4BC0C0'],
                borderWidth: 1
            }]
        };

        // Configuração do gráfico de gastos e lucro
        const configGastosLucro = {
            type: 'bar',
            data: dadosGastosLucro,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Gastos e Lucro'
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart',
                }
            }
        };

        // Dados para o gráfico de deduções
        const dadosDeducoes = {
            labels: ['Impostos', 'Taxa de Cartão', 'Comissão Plataforma', 'Marketing', 'Comissão Vendedor', 'Outras Deduções', 'Custo de Venda', 'Embalagem', 'Frete', 'Outros Insumos'],
            datasets: [{
                label: 'Valores em R$',
                data: [
                    precoVenda * impostos / 100,
                    precoVenda * taxaCartao / 100,
                    precoVenda * comissaoPlataforma / 100,
                    precoVenda * marketing / 100,
                    precoVenda * comissaoVendedor / 100,
                    precoVenda * outrasDeducoes / 100,
                    custoVenda,
                    embalagem,
                    frete,
                    outrosInsumos
                ],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                ],
                borderColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                ],
                borderWidth: 1
            }]
        };

        // Configuração do gráfico de deduções
        const configDeducoes = {
            type: 'bar',
            data: dadosDeducoes,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Detalhamento das Deduções'
                    }
                }
            }
        };

        // Destruir os gráficos anteriores (se existirem)
        if (graficoGastosLucro) {
            graficoGastosLucro.destroy();
        }
        if (graficoDeducoes) {
            graficoDeducoes.destroy();
        }

        // Criar os gráficos
        const ctxGastosLucro = document.getElementById('graficoGastosLucro').getContext('2d');
        graficoGastosLucro = new Chart(ctxGastosLucro, configGastosLucro);

        const ctxDeducoes = document.getElementById('graficoDeducoes').getContext('2d');
        graficoDeducoes = new Chart(ctxDeducoes, configDeducoes);

        // Esconde o loading
        document.getElementById('loading').style.display = 'none';
    }, 1000); // Simula um tempo de carregamento de 1 segundo
}

// Função para ajustar o preço de venda para atingir a margem mínima
function ajustarPreco() {
    const custo = parseFloat(document.getElementById('custo').value);
    const impostos = parseFloat(document.getElementById('impostos').value) || 0;
    const taxaCartao = parseFloat(document.getElementById('taxaCartao').value) || 0;
    const comissaoPlataforma = parseFloat(document.getElementById('comissaoPlataforma').value) || 0;
    const marketing = parseFloat(document.getElementById('marketing').value) || 0;
    const comissaoVendedor = parseFloat(document.getElementById('comissaoVendedor').value) || 0;
    const outrasDeducoes = parseFloat(document.getElementById('outrasDeducoes').value) || 0;
    const custoVenda = parseFloat(document.getElementById('custoVenda').value) || 0;
    const embalagem = parseFloat(document.getElementById('embalagem').value) || 0;
    const frete = parseFloat(document.getElementById('frete').value) || 0;
    const outrosInsumos = parseFloat(document.getElementById('outrosInsumos').value) || 0;

    const margemMinimaDesejada = 40; // Em porcentagem
    const precoMinimo = (custo + custoVenda + embalagem + frete + outrosInsumos) / (1 - (margemMinimaDesejada / 100 + (impostos + taxaCartao + comissaoPlataforma + marketing + comissaoVendedor + outrasDeducoes) / 100));

    document.getElementById('precoVenda').value = precoMinimo.toFixed(2);
    calcularPreco();
}

// Função para mostrar notificações
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Função para salvar dados no localStorage
function salvarDados() {
    const dados = {
        custo: document.getElementById('custo').value,
        precoVenda: document.getElementById('precoVenda').value,
        impostos: document.getElementById('impostos').value,
        taxaCartao: document.getElementById('taxaCartao').value,
        comissaoPlataforma: document.getElementById('comissaoPlataforma').value,
        marketing: document.getElementById('marketing').value,
        comissaoVendedor: document.getElementById('comissaoVendedor').value,
        outrasDeducoes: document.getElementById('outrasDeducoes').value,
        custoVenda: document.getElementById('custoVenda').value,
        embalagem: document.getElementById('embalagem').value,
        frete: document.getElementById('frete').value,
        outrosInsumos: document.getElementById('outrosInsumos').value
    };
    localStorage.setItem('dadosCalculadora', JSON.stringify(dados));
    showNotification('Dados salvos com sucesso!', 'success');
}

// Função para carregar dados do localStorage
function carregarDados() {
    const dados = JSON.parse(localStorage.getItem('dadosCalculadora'));
    if (dados) {
        document.getElementById('custo').value = dados.custo;
        document.getElementById('precoVenda').value = dados.precoVenda;
        document.getElementById('impostos').value = dados.impostos;
        document.getElementById('taxaCartao').value = dados.taxaCartao;
        document.getElementById('comissaoPlataforma').value = dados.comissaoPlataforma;
        document.getElementById('marketing').value = dados.marketing;
        document.getElementById('comissaoVendedor').value = dados.comissaoVendedor;
        document.getElementById('outrasDeducoes').value = dados.outrasDeducoes;
        document.getElementById('custoVenda').value = dados.custoVenda;
        document.getElementById('embalagem').value = dados.embalagem;
        document.getElementById('frete').value = dados.frete;
        document.getElementById('outrosInsumos').value = dados.outrosInsumos;
        showNotification('Dados carregados com sucesso!', 'success');
    } else {
        showNotification('Nenhum dado salvo encontrado.', 'error');
    }
}

// Função para alternar o menu mobile
function toggleMenu() {
    const menu = document.getElementById('navbarMenu');
    menu.classList.toggle('active');
}