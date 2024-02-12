export const StringHelper = {

    isURLVideo(url: string | null | undefined) {
      return (url?.split('?')[0].toLowerCase().match(/\.(mp4|mov|webm|avi|wmv|mkv)$/) !== null);
    },
    
    getURLEnd(url: string) {
      const last = (decodeURIComponent(url.split('/').pop() ?? ''));
      if (last.length === 0) {
        return '';
      }
    
      const endings = last.split('?')[0];
      return endings.toLowerCase();
    },
    
    includesInWords(text: string | null | undefined, word: string) {
      
      if(!text) return false;
      const filter = text?.trim().replaceAll('?', '').replaceAll('.', '').replaceAll('!', '');
      const trimmed = word.trim();
      const word1 = ` ${trimmed} `;
      const word2 = ` ${trimmed}`;
      const word4 = `${trimmed} `;

      if (filter.includes(' ')) {
        return [
          word1, word2, word4,
        ].some((substring) => filter.includes(substring));
      }
      return [
        word1, word2, word4, trimmed,
      ].some((substring) => filter.trim().includes(substring));
    },
    
    toCloudFlareURL(url: string): string {
      if (!url) return '';
    
      const get = url.split('/');
    
      if (get.length > 2 && get[2] === 'images.rentbabe.com') return `${url}`;
    
      const last = get.at(-1);
      const baseURI = 'https://images.rentbabe.com/';

      if(!last) return '';
    
      let path = '';
      const folders = last.split('%2F');
      for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        path += `${folder}${index === (folders.length - 1) ? '' : '/'}`;
      }
    
      function getURLQueryStringValue(url: string, key: string) {
        // eslint-disable-next-line no-useless-escape
        return decodeURIComponent(url.replace(new RegExp(`^(?:.*[&\\?]${encodeURIComponent(key).replaceAll(/[*+.]/g, '\\$&')}(?:\\=([^&]*))?)?.*$`, 'i'), '$1'));
      }
    
      const rentbh = getURLQueryStringValue(path, 'rentbh');
      const rentbw = getURLQueryStringValue(path, 'rentbw');
      const time = getURLQueryStringValue(path, 't');
    
      const myPath = path.split('?')[0];
      const queryWidth = rentbw ? `&rentbw=${rentbw}` : '';
      const queryHeight = rentbh ? `&rentbh=${rentbh}` : '';
      const queryTime = time ? `&t=${time}` : '';
    
      const finalURL = `${baseURI}${myPath}?${queryHeight}${queryWidth}${queryTime}`; // baseURI + path.split("?")[0] + `?rentbh=${rentbh}&rentbw=${rentbw}` + `${time ? `&t=${time}` : ''}`
      return finalURL;
    },
    
    bubbleMessage(text: string): string {

      if (!text) return text;
    
      // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim; //eslint-disable-line
    
      // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim; //eslint-disable-line
    
      // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim; //eslint-disable-line
    
      return text
        .replaceAll(urlPattern, '<a class="break-all" target="_blank" href="$&">$&</a>')
        .replaceAll(pseudoUrlPattern, '$1<a class="break-all" target="_blank"  href="http://$2">$2</a>')
        .replaceAll(emailAddressPattern, '<a class="break-all" target="_blank"  href="mailto:$&">$&</a>')
        .replaceAll(/\r\n|\r|\n/g, '<br>');
    },

    getQueryFromStringValue(text: string | null | undefined, key: string) {
        if(!text) return undefined
        const url = new URL(text.toString());
        return url.searchParams.get(key) ?? ""
    },
    
    srcSetConvert(url: string): string {
      if (!url) return '';
      const last = url.split('/').pop();
      if (!last) return '';
    
      const lastName = last.split('%2F').pop();
      if (!lastName) return '';
    
      const sizes = [150, 240, 320, 480, 640];
    
      let srcSet = '';
      sizes.forEach((size) => {
        const newLastName = `thumb%40${size}_${lastName}`;
        const newFullURL = url.replace(lastName, newLastName);
        srcSet += `${newFullURL} ${size}w,`;
      });
    
      return srcSet;
    },
    
    getWidthHeight(url: string | null | undefined): { width: number, height: number } {

      if (!url) {
        return {
          width: 0,
          height: 0,
        }
      }
    
      const key1 = 'rentbw';
      const key2 = 'rentbh';
    
      function getKey(url: string, key: string) {
        // eslint-disable-next-line
          return decodeURIComponent(url.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
      }
    
      const width = Number.parseInt(getKey(this.toString(), key1));
      const height = Number.parseInt(getKey(this.toString(), key2));
    
      return {
        width,
        height
      }
    }

}