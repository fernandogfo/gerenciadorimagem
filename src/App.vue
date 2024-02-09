<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadImage">Enviar Imagem</button>

    <h2>Imagens Originais</h2>
    <div v-for="originalImage in originalImages" :key="originalImage.id">
      <img :src="originalImage.imagem" alt="Imagem Original" />
      <p>{{ originalImage.dimensoes }}</p>
    </div>

    <h2>Imagens Reduzidas</h2>
    <div v-for="reducedImage in reducedImages" :key="reducedImage.id">
      <img :src="reducedImage.imagem" alt="Imagem Reduzida" />
      <p>{{ reducedImage.dimensoes }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000'; // Seu servidor
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE';

export default {
  data() {
    return {
      originalImages: [],
      reducedImages: [],
      selectedFile: null,
    };
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadImage() {
      if (!this.selectedFile) {
        alert('Por favor, selecione uma imagem.');
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        const base64Image = reader.result.split(',')[1];
        axios.post('https://functionfernandopf.azurewebsites.net/api/UploadImagem', { imagem: base64Image })
            .then(response => {
              console.log('Imagem enviada com sucesso!', response.data);
            })
            .catch(error => {
              console.error('Erro ao enviar a imagem:', error);
            });
      };
    },
    fetchImages() {
      axios.get('https://functionfernandopf.azurewebsites.net/api/GetImages')
          .then(response => {
            this.originalImages = response.data.originais;
            this.reducedImages = response.data.redimensionadas;
          })
          .catch(error => {
            console.error('Erro ao buscar as imagens:', error);
          });
    },
  },
  created() {
    // Ao criar o componente, carrega as imagens originais e reduzidas
    this.fetchImages();
  },
};
</script>