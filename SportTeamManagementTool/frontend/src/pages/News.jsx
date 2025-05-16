import './News.css';
import newsBenfica from '../assets/BenficaNews.jpg';

const fakeNews = [
  {
    id: 1,
    title: "Benfica Sub-19 vence clássico por 3-1",
    description: "Jogo intenso no Seixal termina com vitória da equipa da casa.",
    image: newsBenfica,
    date: "2025-05-10",
  },
  {
    id: 2,
    title: "Nova aplicação melhora desempenho dos jogadores",
    description: "Equipa técnica implementa app de monitorização de treino com sucesso.",
    image: newsBenfica,
    date: "2025-05-12",
  },
  {
    id: 3,
    title: "Treinador revela plano tático inédito",
    description: "Nova formação 3-4-3 pode revolucionar o campeonato juvenil.",
    image: newsBenfica,
    date: "2025-05-14",
  },
];

function News() {
  return (
    <div className="news-container">
      <h1>Notícias</h1>
      <div className="news-grid">
        {fakeNews.map((news) => (
          <div key={news.id} className="news-card">
            <img src={news.image} alt={news.title} />
            <div className="news-content">
              <h3>{news.title}</h3>
              <p>{news.description}</p>
              <small>{new Date(news.date).toLocaleDateString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
