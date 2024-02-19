<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadImage">Enviar Imagem</button>

    <h2>Imagens Originais</h2>
    <div style="display: flex; overflow-x: auto; white-space: nowrap;">
      <div v-for="originalImage in originalImages" :key="originalImage.id" style="display: inline-block; margin-right: 10px;">
        <img :src="originalImage.imagem" alt="Imagem Original" />
        <p>{{ originalImage.dimensoes }}</p>
      </div>
    </div>

    <h2>Imagens Reduzidas</h2>
    <div style="display: flex; overflow-x: auto; white-space: nowrap;">
      <div v-for="reducedImage in reducedImages" :key="reducedImage.id" style="display: inline-block; margin-right: 10px;">
        <img :src="reducedImage.imagem" alt="Imagem Reduzida" />
        <p>{{ reducedImage.dimensoes }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const uploadImagesApiUrl = "https://functionfernandopf.azurewebsites.net/api/UploadImagem";
const getImagesApiUrl = "https://functionfernandopf.azurewebsites.net/api/GetImages";
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
        axios.post(uploadImagesApiUrl, { imagem: base64Image })
            .then(response => {
              console.log('Imagem enviada com sucesso!', response.data);
            })
            .catch(error => {
              console.error('Erro ao enviar a imagem:', error);
            });
      };
      this.fetchImages();
      this.data();
    },
    fetchImages() {
      axios.get(getImagesApiUrl)
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