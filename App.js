import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function App() {
  const [dados, setDados] = useState({
    membros: [],
    ministerios: [],
    visitas: [],
    lideres: [],
    sermoes: [],
    comunicados: [],
    indicadores: []
  });

  const [modulo, setModulo] = useState('membros');
  const [input, setInput] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const armazenados = localStorage.getItem('painelPastoral');
    if (armazenados) setDados(JSON.parse(armazenados));
  }, []);

  useEffect(() => {
    localStorage.setItem('painelPastoral', JSON.stringify(dados));
  }, [dados]);

  const handleSalvar = () => {
    const lista = [...dados[modulo]];
    if (editIndex !== null) {
      lista[editIndex] = input;
    } else {
      lista.push(input);
    }
    setDados({ ...dados, [modulo]: lista });
    setInput({});
    setEditIndex(null);
  };

  const handleEditar = (index) => {
    setInput(dados[modulo][index]);
    setEditIndex(index);
  };

  const handleRemover = (index) => {
    const lista = [...dados[modulo]];
    lista.splice(index, 1);
    setDados({ ...dados, [modulo]: lista });
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const colunas = Object.keys(input);
    const linhas = dados[modulo].map(obj => colunas.map(c => obj[c] || ''));
    doc.text(`Exportação - ${modulo}`, 14, 16);
    autoTable(doc, { startY: 20, head: [colunas], body: linhas });
    doc.save(`${modulo}.pdf`);
  };

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dados[modulo]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    XLSX.writeFile(workbook, `${modulo}.xlsx`);
  };

  const campos = {
    membros: ['nome', 'email', 'nascimento', 'status', 'obs'],
    ministerios: ['nome', 'obs'],
    visitas: ['nome', 'motivo'],
    lideres: ['nome', 'progresso'],
    sermoes: ['titulo', 'texto'],
    comunicados: ['destinatario', 'mensagem'],
    indicadores: ['nome', 'valor']
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Painel Pastoral</h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.keys(campos).map(key => (
          <button key={key} onClick={() => { setModulo(key); setInput({}); setEditIndex(null); }}>
            {key}
          </button>
        ))}
      </div>
      <h2>Módulo: {modulo}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 400, gap: 10 }}>
        {campos[modulo].map(c => (
          <input
            key={c}
            placeholder={c}
            value={input[c] || ''}
            onChange={e => setInput({ ...input, [c]: e.target.value })}
          />
        ))}
        <button onClick={handleSalvar}>{editIndex !== null ? 'Atualizar' : 'Salvar'}</button>
        <button onClick={exportarPDF}>Exportar PDF</button>
        <button onClick={exportarExcel}>Exportar Excel</button>
      </div>
      <ul style={{ marginTop: 30 }}>
        {dados[modulo].map((item, index) => (
          <li key={index} style={{ marginBottom: 10 }}>
            {Object.entries(item).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {v}</div>
            ))}
            <button onClick={() => handleEditar(index)}>Editar</button>
            <button onClick={() => handleRemover(index)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;