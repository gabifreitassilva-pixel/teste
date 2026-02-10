/**
 * FISCAL AUDIT V17 - BRAIN
 * Consolidação de Lógica, Dados e Interface
 */

const app = {
    // =========================================================================
    // 1. BASES DE CONHECIMENTO (EXTRAÍDAS DOS HTMLS)
    // =========================================================================
    db: {
        // Exemplo da estrutura (Na versão final, cole os arrays completos aqui)
        st: [
            ["3815.12.10", "Catalisadores", "Convênio 142/18"], 
            ["2203.00.00", "Cerveja", "Convênio 142/18"],
            ["8708.99.90", "Autopeças", "Convênio 142/18"],
            // ... (O sistema fará busca parcial, então os principais NCMS bastam)
        ],
        pis_cofins: [
            ["2710.12.59", "Gasolina", "Monofásico"],
            ["3004.90.99", "Medicamentos", "Monofásico"],
            ["2202.10.00", "Refrigerantes", "Monofásico"],
            ["8708", "Autopeças", "Monofásico"]
            // ...
        ],
        beneficios: [
            ["1006", "Arroz", "Redução BC"],
            ["0713", "Feijão", "Redução BC"]
        ]
    },

    state: {
        xmlData: JSON.parse(localStorage.getItem('fa_xml')) || [],
        pgdasData: JSON.parse(localStorage.getItem('fa_pgdas')) || [],
        userRules: JSON.parse(localStorage.getItem('fa_rules')) || {},
        tempItem: null
    },

    // =========================================================================
    // 2. SISTEMA DE NAVEGAÇÃO
    // =========================================================================
    init: function() {
        this.renderHistoryXML();
        this.renderHistoryPGDAS();
        this.renderRules();
    },

    showTab: function(id, el) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if(el) el.classList.add('active');
    },

    formatMoeda: (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),

    // =========================================================================
    // 3. PROCESSAMENTO DE ARQUIVOS (XML & PDF)
    // =========================================================================
    
    // --- XML ---
    handleXML: async function(files) {
        const status = document.getElementById('xml-status');
        status.innerHTML = `<span class="text-orange-500"><i class="fas fa-spinner fa-spin"></i> Processando ${files.length} arquivos...</span>`;
        
        let processedCount = 0;

        for (let file of files) {
            if (file.name.endsWith('.xml')) {
                const text = await file.text();
                this.parseXMLContent(text, file.name);
                processedCount++;
            } 
            // Adicionar suporte a ZIP se necessário usando JSZip aqui
        }

        this.saveData();
        this.renderHistoryXML();
        status.innerHTML = `<span class="text-green-500"><i class="fas fa-check"></i> ${processedCount} XMLs importados com sucesso!</span>`;
    },

    parseXMLContent: function(xmlText, fileName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, "text/xml");
        
        // Dados Gerais
        const infNFe = doc.getElementsByTagName("infNFe")[0];
        const id = infNFe ? infNFe.getAttribute("Id") : "N/A";
        const dhEmi = doc.getElementsByTagName("dhEmi")[0]?.textContent || new Date().toISOString();
        const totalNF = parseFloat(doc.getElementsByTagName("vNF")[0]?.textContent || 0);

        // Itens
        const dets = doc.getElementsByTagName("det");
        for (let det of dets) {
            const prod = det.getElementsByTagName("prod")[0];
            const imposto = det.getElementsByTagName("imposto")[0];
            
            // Tentar pegar ICMS
            let cst = "00";
            let cfop = prod.getElementsByTagName("CFOP")[0]?.textContent;
            
            // Busca recursiva básica por CST/CSOSN
            const icmsTags = imposto.getElementsByTagName("ICMS")[0]?.children[0];
            if (icmsTags) {
                cst = icmsTags.getElementsByTagName("CST")[0]?.textContent || 
                      icmsTags.getElementsByTagName("CSOSN")[0]?.textContent || "00";
            }

            const item = {
                file: fileName,
                id: id,
                data: dhEmi.substring(0,10), // AAAA-MM-DD
                ncm: prod.getElementsByTagName("NCM")[0]?.textContent,
                desc: prod.getElementsByTagName("xProd")[0]?.textContent,
                vProd: parseFloat(prod.getElementsByTagName("vProd")[0]?.textContent),
                cfop: cfop,
                cst: cst
            };
            this.state.xmlData.push(item);
        }
    },

    // --- PGDAS (PDF) ---
    handlePGDAS: async function(files) {
        const status = document.getElementById('pgdas-status');
        status.innerHTML = `<span class="text-orange-500"><i class="fas fa-spinner fa-spin"></i> Lendo PDF...</span>`;
        
        // Simulação de leitura para demonstração (PDF parsing real requer lógica complexa de coordenadas)
        // Aqui simulamos que o sistema leu o PDF e encontrou um valor.
        // Em produção, usaríamos pdf.js textContent para buscar regex de "Receita Bruta" e "Período"
        
        const simulatedData = {
            competencia: "2026-01",
            receita: 150000.00,
            atividades: "Comércio de Mercadorias com ST"
        };

        this.state.pgdasData.push(simulatedData);
        this.saveData();
        this.renderHistoryPGDAS();
        
        status.innerHTML = `<span class="text-green-500"><i class="fas fa-check"></i> Dados extraídos (Simulado: Jan/2026)</span>`;
    },

    // =========================================================================
    // 4. LÓGICA DE AUDITORIA INTELIGENTE
    // =========================================================================
    runAudit: function() {
        this.showTab('panel-audit');
        const tbody = document.getElementById('tbody-audit');
        tbody.innerHTML = '';
        
        let totalXml = 0;

        // 1. Processar Itens
        this.state.xmlData.forEach(item => {
            totalXml += item.vProd;
            
            // Analisar
            const analysis = this.analyzeItem(item.ncm);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono text-orange-500">${item.ncm}</td>
                <td class="text-[10px]">${item.desc.substring(0,30)}...</td>
                <td>${item.cfop}</td>
                <td>${item.cst}</td>
                <td>${analysis.badge}</td>
                <td class="text-[9px] italic text-zinc-500">${analysis.legal}</td>
            `;
            // Adicionar evento de clique para correção
            tr.onclick = () => this.openCorrectionModal(item);
            tbody.appendChild(tr);
        });

        // 2. Totais
        const totalPgdas = this.state.pgdasData.reduce((acc, curr) => acc + curr.receita, 0);
        const diff = totalPgdas - totalXml;

        document.getElementById('audit-total-xml').innerText = this.formatMoeda(totalXml);
        document.getElementById('audit-total-pgdas').innerText = this.formatMoeda(totalPgdas);
        
        const diffEl = document.getElementById('audit-diff');
        diffEl.innerText = this.formatMoeda(diff);
        diffEl.className = `text-2xl font-mono font-bold ${diff < 0 ? 'text-red-500' : 'text-green-500'}`;
    },

    analyzeItem: function(ncm) {
        // 1. Verificar Regras do Usuário (Prioridade Máxima)
        if (this.state.userRules[ncm]) {
            return {
                badge: `<span class="badge bg-ok">USUÁRIO: ${this.state.userRules[ncm]}</span>`,
                legal: "Regra Manual"
            };
        }

        // 2. Verificar Base ST
        // Lógica simples: Se o NCM começa com algo que está na base
        const inST = this.db.st.find(r => ncm.startsWith(r[0]));
        if (inST) {
            return {
                badge: `<span class="badge bg-st">ICMS ST</span>`,
                legal: inST[2] + " (" + inST[1] + ")"
            };
        }

        // 3. Verificar PIS/COFINS Monofásico
        const inMono = this.db.pis_cofins.find(r => ncm.startsWith(r[0]));
        if (inMono) {
            return {
                badge: `<span class="badge bg-mono">MONOFÁSICO</span>`,
                legal: "Lei 10.147/10.485"
            };
        }

        // 4. Padrão
        return {
            badge: `<span class="badge bg-zinc-700 text-white">TRIBUTADO</span>`,
            legal: "Regra Geral"
        };
    },

    // =========================================================================
    // 5. CORREÇÃO E REGRAS
    // =========================================================================
    openCorrectionModal: function(item) {
        this.state.tempItem = item;
        document.getElementById('modal-ncm-display').innerText = item.ncm;
        document.getElementById('modal-desc-display').innerText = item.desc;
        document.getElementById('modal-correction').classList.remove('hidden');
    },

    saveRule: function() {
        const type = document.getElementById('modal-select-type').value;
        const ncm = this.state.tempItem.ncm;
        
        this.state.userRules[ncm] = type;
        this.saveData();
        
        document.getElementById('modal-correction').classList.add('hidden');
        this.runAudit(); // Re-executa auditoria com a nova regra
        this.renderRules();
    },

    renderRules: function() {
        const tbody = document.getElementById('tbody-regras');
        tbody.innerHTML = '';
        Object.entries(this.state.userRules).forEach(([ncm, rule]) => {
            tbody.innerHTML += `
                <tr>
                    <td class="font-mono text-orange-500">${ncm}</td>
                    <td class="font-bold text-white">${rule}</td>
                    <td><button onclick="app.deleteRule('${ncm}')" class="text-red-500"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });
    },

    deleteRule: function(ncm) {
        delete this.state.userRules[ncm];
        this.saveData();
        this.renderRules();
    },

    // =========================================================================
    // 6. UTILITÁRIOS E PERSISTÊNCIA
    // =========================================================================
    saveData: function() {
        localStorage.setItem('fa_xml', JSON.stringify(this.state.xmlData));
        localStorage.setItem('fa_pgdas', JSON.stringify(this.state.pgdasData));
        localStorage.setItem('fa_rules', JSON.stringify(this.state.userRules));
    },

    clearData: function(type) {
        if(confirm("Tem certeza?")) {
            if(type === 'xml') { this.state.xmlData = []; }
            if(type === 'pgdas') { this.state.pgdasData = []; }
            this.saveData();
            this.init();
        }
    },

    renderHistoryXML: function() {
        const tbody = document.getElementById('tbody-xml');
        tbody.innerHTML = this.state.xmlData.slice(0, 50).map(i => `
            <tr>
                <td>${i.data}</td>
                <td class="text-[9px]">${i.id.substring(0,20)}...</td>
                <td class="font-mono text-orange-500">${i.ncm}</td>
                <td class="text-[10px]">${i.desc.substring(0,30)}</td>
                <td>${this.formatMoeda(i.vProd)}</td>
            </tr>
        `).join('') + (this.state.xmlData.length > 50 ? '<tr><td colspan="5" class="text-center text-xs p-2">... e mais itens</td></tr>' : '');
    },

    renderHistoryPGDAS: function() {
        const tbody = document.getElementById('tbody-pgdas');
        tbody.innerHTML = this.state.pgdasData.map(i => `
            <tr>
                <td>${i.competencia}</td>
                <td class="font-bold text-green-500">${this.formatMoeda(i.receita)}</td>
                <td class="text-xs">${i.atividades}</td>
            </tr>
        `).join('');
    }
};

// Inicializar
window.onload = () => app.init();