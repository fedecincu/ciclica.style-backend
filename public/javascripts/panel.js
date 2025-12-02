// panel.js - admin panel interactions: send queries to backend /api and render results
document.addEventListener('DOMContentLoaded', function () {
  console.log('Admin panel script loaded — ready to send queries to backend');

  const form = document.getElementById('panel-query-form');
  const input = document.getElementById('query-input');
  const type = document.getElementById('query-type');
  const resultEl = document.getElementById('panel-result');

  if (!form) return; // nothing to do if UI not present

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    resultEl.innerHTML = 'Cargando...';
    const qType = (type && type.value) || 'catalogo';
    const q = (input && input.value && input.value.trim()) || '';

    try {
      let url = '/api/catalogo';
      if (qType === 'producto') {
        if (!q) {
          resultEl.innerHTML = '<div class="alert alert-warning">Ingresa un ID de producto para buscar.</div>';
          return;
        }
        url = `/api/catalogo/${encodeURIComponent(q)}`;
      }
      else if (qType === 'contacto') {
        if (!q) {
          resultEl.innerHTML = '<div class="alert alert-warning">Ingresa un ID de contacto para buscar.</div>';
          return;
        }
        url = `/api/contactos/${encodeURIComponent(q)}`;
      } else if (qType === 'contactos') {
        url = '/api/contactos';
      }

      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      let body;
      if (contentType.includes('application/json')) body = await res.json();
      else body = await res.text();

      if (!res.ok) {
        resultEl.innerHTML = `<div class="alert alert-danger">Error: ${res.status} — ${escapeHtml(String(body && (body.error || JSON.stringify(body))))}</div>`;
        return;
      }

      // Render result nicely
      if (qType === 'producto') {
        if (!body || !body.id) {
          resultEl.innerHTML = '<div class="alert alert-info">Producto no encontrado.</div>';
          return;
        }
        const html = `
          <div class="row">
            <div class="col-md-4"><img src="${body.imagen || '/ciclica/logo.jpg'}" alt="img" style="max-width:100%; border-radius:6px;" /></div>
            <div class="col-md-8">
              <h4>${escapeHtml(body.nombre || 'Sin nombre')}</h4>
              <p><strong>Precio:</strong> ${escapeHtml(String(body.precio ?? 'N/A'))}</p>
              <p>${escapeHtml(body.descripcion || '')}</p>
            </div>
          </div>
        `;
        resultEl.innerHTML = html;
        return;
      }

      // for catalog list (array)
      if (Array.isArray(body)) {
        // if this is a contactos array show contact list specially
        if (body.length && body[0] && Object.prototype.hasOwnProperty.call(body[0], 'mensaje')) {
          const list = body.map(c => `
            <div style="padding:8px; border-bottom:1px solid #eee;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${escapeHtml(c.nombre || '(sin nombre)')}</strong> &nbsp; <small>&lt;${escapeHtml(c.email || '')}&gt;</small></div>
                <div style="font-size:12px;color:#666">${escapeHtml(String(c.creado_en || ''))} • id:${escapeHtml(String(c.id || ''))}</div>
              </div>
              <div style="margin-top:6px; white-space:pre-wrap;">${escapeHtml(c.mensaje || '')}</div>
            </div>
          `).join('');
          resultEl.innerHTML = list;
          return;
        }
        if (body.length === 0) {
          resultEl.innerHTML = '<div class="alert alert-info">Catálogo vacío.</div>';
          return;
        }
        const list = body.map(p => `
          <div style="display:flex; gap:10px; margin-bottom:8px; align-items:center;">
            <img src="${p.imagen || '/ciclica/logo.jpg'}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:6px;" />
            <div>
              <strong>${escapeHtml(p.nombre || 'Sin nombre')}</strong><br/>
              <small>${escapeHtml(String(p.precio ?? 'N/A'))} • id: ${escapeHtml(String(p.id ?? ''))}</small>
            </div>
          </div>
        `).join('');
        resultEl.innerHTML = list;
        return;
      }

      // fallback: show raw JSON
      resultEl.innerHTML = `<pre style="white-space:pre-wrap; word-break:break-word;">${escapeHtml(JSON.stringify(body, null, 2))}</pre>`;
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-danger">Error al conectar: ${escapeHtml(String(err && err.message || err))}</div>`;
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
