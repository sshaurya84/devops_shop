import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [products, setProducts] = React.useState([]);
  const [status, setStatus] = React.useState('Loading products…');

  React.useEffect(() => {
    // Relative URLs work in both environments. Vite proxies /api while we
    // develop; Nginx proxies /api when the application is containerized.
    fetch('/api/products')
      .then((response) => {
        if (!response.ok) throw new Error('Product service unavailable');
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setStatus('');
      })
      .catch(() => setStatus('Could not reach the product service. Is it running on port 3001?'));
  }, []);

  return (
    <main>
      <header><span>DEVOPS SHOP</span><strong>Lesson 1</strong></header>
      <section className="hero"><p>Everyday essentials</p><h1>A small shop built to travel from local code to EKS.</h1></section>
      {status && <p className="status">{status}</p>}
      <section className="grid">
        {products.map((product) => (
          <article key={product.id}>
            <div className="placeholder">{product.name.slice(0, 1)}</div>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <strong>${Number(product.price).toFixed(2)}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
