'use client';

import { useState } from 'react';

const SUPABASE_URL = 'https://wiedgjivfsxwsunuzqbm.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZWRnaml2ZnN4d3N1bnV6cWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDUwNDIsImV4cCI6MjA5NDIyMTA0Mn0._C_7iJC419R3zX88ApYatZx9IrboYt8GC5UHIu44gQ0';
const BUCKET = 'depoimentos-fotos';

export default function DepoimentoPage() {
  const [form, setForm] = useState({
    nome_noiva: '',
    depoimento: '',
    instagram: '',
    nome_produto: '',
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      let foto_url = '';

      if (foto) {
        const ext = foto.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;

        const uploadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': foto.type,
            },
            body: foto,
          }
        );

        if (!uploadRes.ok) throw new Error('Erro ao enviar foto');

        foto_url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
      }

      const payload = { ...form, foto_url };

      const submitRes = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          form_id: 'depoimento-blanc',
          payload,
        }),
      });

      if (!submitRes.ok) throw new Error('Erro ao enviar depoimento');

      setStatus('success');
      setForm({ nome_noiva: '', depoimento: '', instagram: '', nome_produto: '' });
      setFoto(null);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro inesperado');
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#1a1a1a' }}>
          Histórias Blanc
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>
          Cada detalhe conta. Cada noiva, uma história.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>Obrigada! 🤍</p>
            <p style={{ fontSize: 14, color: '#888' }}>Seu depoimento foi enviado com sucesso.</p>
            <button
              onClick={() => setStatus('idle')}
              style={{ marginTop: 24, padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
            >
              Enviar outro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Nome da noiva">
              <input
                name="nome_noiva"
                value={form.nome_noiva}
                onChange={handleChange}
                required
                placeholder="Seu nome"
              />
            </Field>

            <Field label="Depoimento">
              <textarea
                name="depoimento"
                value={form.depoimento}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Conte sua experiência..."
              />
            </Field>

            <Field label="Instagram (opcional)">
              <input
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="@seuperfil"
              />
            </Field>

            <Field label="Nome do produto comprado">
              <input
                name="nome_produto"
                value={form.nome_produto}
                onChange={handleChange}
                required
                placeholder="Ex: Véu Blanc"
              />
            </Field>

            <Field label="Foto (opcional)">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              />
            </Field>

            {status === 'error' && (
              <p style={{ color: '#dc2626', fontSize: 13 }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '14px',
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                marginTop: 4,
              }}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar depoimento'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#444' }}>{label}</label>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  );
}
