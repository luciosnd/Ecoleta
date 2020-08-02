import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import ibge from '../../services/ibge';
import { LeafletMouseEvent } from 'leaflet';
import Modal from 'react-modal';
import './styles.css'

//para estados de array ou object: informar o tipo da variavel
interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface UF {
  id: number;
  sigla: string;
}

interface City{
  id: number;
  nome: string;
}

const CreatePoint = () => {
  const histoy = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<UF[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [initialPosition, setinitialPosition] = useState<[number, number]>([0, 0]);

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  // roda apenas uma vez, logo depois do componente set renderizado
  useEffect(() => {
    api.get('items').then((reponse) => {
      setItems(reponse.data);
    });

    ibge.get('localidades/estados').then((response) => {
      setUfs(response.data);
    });

    navigator.geolocation.getCurrentPosition(position => {
      setinitialPosition([position.coords.latitude, position.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') return;

    ibge.get(`localidades/estados/${selectedUf}/municipios`).then((response) => {
      setCities(response.data);
    });
  }, [selectedUf]);

  function handleUfSelect(event: ChangeEvent<HTMLSelectElement>) {    
    setSelectedUf(event.target.value);
  }

  function handleCitySelect(event: ChangeEvent<HTMLSelectElement>) {    
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target;

    setFormData({...formData, [name]: value});
  }

  function handleItemSelect(id: number) {
    if (selectedItems.includes(id)) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    }
    else{
      setSelectedItems([...selectedItems, id]);
    }
  }

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      ...formData,
      image: "hmkkbjs.img" ,
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
      city: selectedCity,
      uf: selectedUf, 
      items: selectedItems
    }

    await api.post('points', data);

    toggleModal();

    setTimeout(() => histoy.push('/'), 2000);    
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>
        
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>          
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={13.25} onCLick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleUfSelect}>
                <option value="0">Selecione um estado</option>
                {ufs.map(uf => (
                  <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleCitySelect}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city.id} value={city.nome}>{city.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">

            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleItemSelect(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}            
            
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>

      </form>

      <Modal
        isOpen={isOpen}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="mymodal"
        overlayClassName="myoverlay"
      >
        <FiCheckCircle size={50} />
        <h1>Cadastro Concluído!</h1>
      </Modal>
    </div>
  );
}

export default CreatePoint;