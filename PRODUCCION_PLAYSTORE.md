# 🚀 NovaGuardian - Guía de Producción y Play Store

## ✅ Configuración Actual
- **Backend URL:** `https://backend-production-2148.up.railway.app`
- **Puerto:** 8080
- **API Base:** `https://backend-production-2148.up.railway.app/api/v1`

---

## 🔧 CORS - Configuración en tu Backend (Railway)

Debes configurar los CORS en tu backend de Spring Boot. En tu archivo de configuración:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "https://backend-production-2148.up.railway.app",
                "exp://10.13.0.8:8081",  // Para desarrollo con Expo Go
                "*"  // En producción, las apps móviles no requieren CORS estricto
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**💡 IMPORTANTE:** Las aplicaciones móviles nativas (APK/AAB) NO tienen restricciones de CORS como los navegadores. Los CORS solo aplican a:
- Expo Go en desarrollo
- Apps web

Para tu APK de Play Store, los CORS NO son un problema.

---

## 📱 Pasos para Publicar en Play Store

### 1️⃣ Crear cuenta de EAS y configurar proyecto

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Configurar el proyecto (esto crea el projectId)
eas build:configure
```

### 2️⃣ Crear cuenta de Google Play Console
1. Ir a https://play.google.com/console
2. Pagar la tarifa única de $25 USD
3. Completar la verificación de identidad

### 3️⃣ Generar el Bundle de Producción (AAB)

```bash
# Build de producción para Android (AAB para Play Store)
eas build --platform android --profile production
```

Esto generará un archivo `.aab` que es el formato requerido por Play Store.

### 4️⃣ Configurar Firebase (Para Push Notifications)

1. Ir a https://console.firebase.google.com
2. Crear proyecto "NovaGuardian"
3. Agregar app Android con package: `com.novaguardian.app`
4. Descargar `google-services.json`
5. Colocar el archivo en la raíz del proyecto

### 5️⃣ Crear la App en Play Console

1. **Crear aplicación** en Play Console
2. Completar:
   - Nombre: NovaGuardian
   - Idioma: Español
   - Tipo: App
   - Gratis/Pago

3. **Ficha de Play Store:**
   - Título: NovaGuardian - Monitor de Salud
   - Descripción breve (80 caracteres)
   - Descripción completa
   - Capturas de pantalla (mínimo 2)
   - Icono de alta resolución (512x512)
   - Gráfico de funciones (1024x500)

4. **Clasificación de contenido:**
   - Completar el cuestionario IARC

5. **Política de privacidad:**
   - Obligatorio para apps que recolectan datos
   - URL de tu política de privacidad

### 6️⃣ Subir el Build

```bash
# Subir automáticamente con EAS Submit
eas submit --platform android --profile production
```

O manualmente:
1. Ir a Play Console > Versión > Producción
2. Crear nueva versión
3. Subir el archivo `.aab`

---

## 📋 Checklist Pre-Publicación

### App
- [ ] Logo/Icono en `assets/icon.png` (1024x1024)
- [ ] Adaptive icon en `assets/adaptive-icon.png`
- [ ] Splash screen configurado
- [ ] `versionCode` incrementado en `app.json`
- [ ] Package name único: `com.novaguardian.app`

### Backend (Railway)
- [ ] HTTPS habilitado ✅ (Railway lo hace automático)
- [ ] CORS configurado para producción
- [ ] Base de datos configurada
- [ ] Variables de entorno seguras
- [ ] SSL/TLS activo

### Firebase
- [ ] Proyecto Firebase creado
- [ ] `google-services.json` descargado
- [ ] Cloud Messaging habilitado

### Play Store
- [ ] Cuenta de desarrollador creada ($25)
- [ ] Capturas de pantalla preparadas
- [ ] Descripción de la app escrita
- [ ] Política de privacidad publicada
- [ ] Gráficos promocionales listos

---

## 🔐 Seguridad para Producción

1. **Nunca subir credenciales a Git:**
   - `google-services.json`
   - `google-play-service-account.json`
   - Cualquier `.env` con secretos

2. **Agregar al `.gitignore`:**
```
google-services.json
google-play-service-account.json
*.keystore
*.jks
.env
```

3. **Variables de entorno en Railway:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGINS`

---

## 📦 Comandos Útiles

```bash
# Build de desarrollo (APK para testing)
eas build --platform android --profile preview

# Build de producción (AAB para Play Store)
eas build --platform android --profile production

# Ver estado de builds
eas build:list

# Actualizar versión OTA (sin pasar por Play Store)
eas update --branch production

# Subir a Play Store
eas submit --platform android
```

---

## 🆘 Troubleshooting Común

### Error: "Network Error" en la app
- Verificar que el backend está corriendo en Railway
- Verificar la URL en `config/index.ts`
- Comprobar conexión a internet del dispositivo

### Error: "CORS blocked"
- Solo aplica en Expo Go o web
- El APK final NO tiene este problema
- Si usas Expo Go, configurar CORS en backend

### Build falla en EAS
- Verificar que `eas.json` está correctamente configurado
- Revisar logs en expo.dev
- Asegurar que el package.json tiene todas las dependencias

---

## 📞 Soporte

Para cualquier duda sobre el proceso:
- Documentación Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Play Console Help: https://support.google.com/googleplay/android-developer

---

**¡Listo para producción!** 🎉
