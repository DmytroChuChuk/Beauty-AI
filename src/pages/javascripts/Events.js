
export default class Events {

 
    constructor(){
       this.document = null
    }

    init(document){

  

        if(document == null){return}

        this.document = document
        this.bindEvents(document);
    }

    deinit() {
        if(this.document == null){return}
        const containers = this.document.querySelectorAll('.horizontal-scroll')
      
        containers.forEach((container) => {
            container.removeEventListener("wheel", this.wheelHandler); 
        })
    }

    bindEvents(document){
        const containers = document.querySelectorAll('.horizontal-scroll')



        containers.forEach((container) => {
           
            container.addEventListener("wheel", this.wheelHandler); 
        })
              
    }

    wheelHandler(evt){

        const node = evt.currentTarget

        
        var left = node.scrollLeft;
  
        var goingLeft = evt.deltaY < 0

        var positionInfo = node.getBoundingClientRect()
        
        const start = node.scrollWidth - positionInfo.width
        const end = 0


        const offSet = Math.abs(left - start)

        if( (offSet > end && !goingLeft) || (offSet < start && goingLeft) ){
            evt.preventDefault();
            evt.currentTarget.scrollLeft += evt.deltaY;
        }
    

    }
   
}