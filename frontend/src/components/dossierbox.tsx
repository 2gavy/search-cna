import React from 'react';
import './dossierbox.css';

interface DossierBoxProps {
  image: string;
  name: string;
  age: number;
  nationality: string;
  moreInfo: string;
}

const DossierBox: React.FC<DossierBoxProps> = ({ image, name, age, nationality, moreInfo }) => {
  return (
    <div className="dossier-box">
      <img src={image} className="dossier-image" />
      <div className="dossier-details">
        <h2 className="dossier-name">{name}</h2>
        <p className="dossier-info"><strong>Age:</strong> {age}</p>
        <p className="dossier-info"><strong>Nationality:</strong> {nationality}</p>
        <p className="dossier-more-info">{moreInfo}</p>
      </div>
    </div>
  );
};

export default DossierBox;
