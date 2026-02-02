# Otimização do Vídeo de Background

## Problema Atual
O arquivo `bg_seniorFloors.mov` tem **1.3GB**, o que é muito grande para uso na web.

## Recomendações

### 1. Converter para MP4 otimizado
Use ferramentas como HandBrake ou FFmpeg para converter:

```bash
# Usando FFmpeg
ffmpeg -i bg_seniorFloors.mov \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  bg_seniorFloors.mp4
```

### 2. Configurações recomendadas:
- **Resolução**: 1920x1080 (Full HD) ou 1280x720 (HD)
- **Codec de vídeo**: H.264
- **Codec de áudio**: AAC
- **Bitrate**: 2-5 Mbps
- **Duração**: 10-30 segundos (loop)
- **Tamanho final**: 5-20 MB

### 3. Criar versão WebM (opcional)
Para melhor compressão:
```bash
ffmpeg -i bg_seniorFloors.mov \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -c:a libopus \
  bg_seniorFloors.webm
```

### 4. Usar serviço de hospedagem de vídeo
Para vídeos grandes, considere usar:
- YouTube (embed)
- Vimeo
- Cloudflare Stream
- AWS MediaConvert

## Teste
Após otimizar, teste o carregamento:
- Abra o DevTools (F12)
- Vá para a aba Network
- Recarregue a página
- Verifique o tempo de carregamento do vídeo
