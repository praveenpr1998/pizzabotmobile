
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GiftedChat,Avatar,Bubble } from 'react-native-gifted-chat';
console.disableYellowBox = true;
const GLOBAL=require('./Global.js');
const BOT_USER = {
  _id: 2,
  name: 'FAQ Bot',
  avatar: 'https://image.freepik.com/free-vector/robot-icon-bot-sign-design-chatbot-symbol-concept-voice-support-service-bot-online-support-bot-vector-stock-illustration_100456-34.jpg'
};
  var cart=[];
class App extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hi! I am the Pizza bot 🤖 from PizzaDoods.\n\nSelect your Need\n1 - Order Pizza 🛎 \n 2 - Check Order Status 🍕\n 3 - Need help/Compliant ☎`,
        createdAt: new Date(),
        user: BOT_USER,
        image: 'https://cdn.iconscout.com/icon/premium/png-512-thumb/pizza-shop-3-1104611.png',
      }
    ],
    process_status:'not_started',
    cartItems:[],
    pizza:[],
    itemSelected:'',
    userAddress:'',
    userMobile:'',
    userName:'',
    orderId:'',
    getQuery:false,
    help:false,
    totalAmount:0,
    feedback:false
  };

  componentDidMount(){
    fetch(GLOBAL.BASE_URL+"orders/getPizza",{
      method:"GET",
    })
    .then(res => res.json())
    .then(
     (result) => {
       console.log(result)
       this.setState({pizza:result.data});
     })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let message = messages[0].text;
    if(this.state.process_status==='not_started'){
    if(message==='order pizza'||message==='1'){
      this.showPizza()
    }
    else if(message==='2'||message==='track order'){
      this.getOrderId();
    }
    else if(message==='3'||message==='Help'||message==='Compliant'||message==='compliant'){
      this.getEmail();
    }
    else if(this.state.trackOrder){
      this.trackOrder(message);
    }
    else if(this.state.help){
      this.help(message);
    }
    else if(this.state.getQuery){
      this.displayOk();
    }
    else{
      this.error();
    }
  }
  else if(this.state.process_status==='started'){
    if(message==='y'||message==='Y'){
      this.showPizza();
    }
    else if(message==='x'||message==='X'){
      this.clearCart();
    }
    else if(message==='cart'||message==='Cart'){
      this.cartView();
    }
    else if(message==='confirm'||message==='Confirm'){
      this.checkout();
    }
    else if(this.state.itemSelected!==''){
      this.setQuantity(parseInt(message));
    }
    else if(parseInt(message)>=11){
      this.selectPizza(parseInt(message));
    }
    else{
      this.error();
    }
  }
  else if(this.state.process_status==='User_details'){
    if(!this.state.numberRecieved){
    this.getMobile(message);
    }
    else if(!this.state.addressRecieved){
      this.getAddress(message);
    }
    else if(!this.state.userDetailsSummary){
      this.userDetailsSummary(message);
    }
    else if(this.state.userDetailsSummary&&(message==='confirm'||message==='Confirm')){
      this.placeOrder();
    }
    else if(this.state.userDetailsSummary&&(message==='cancel'||message==='Cancel')){
      this.clearCart();
    }
    else if(this.state.feedback){
      this.getFeedback(message);
    }
    
  }
    else{
      this.error();
    }
  }

  getFeedback(message){
    console.log('ianwdwndk')
    fetch(GLOBAL.BASE_URL+"orders/feedback/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({userName:this.state.userName,userMobile:this.state.userMobile,feedback:message}),
      })
    .then(res => res.json())
    .then(
     (result) => {
       if(result.status){
        let msg= {
          _id: new Date(),
          text: 'Thanks for the feedback',
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
         feedback:false
        }));
        this.clearCart();
       }
       else{
        let msg= {
          _id: new Date(),
          text: `OOpss..Soemthing went wrong...Order again 🙄`,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
       }
     })
  }

  getOrderId(){
    let msg= {
      _id: new Date(),
      text: `Enter the orderID to track 😺`,
      createdAt: new Date(),
      user: BOT_USER
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));
    this.setState({trackOrder:true});
  }

  trackOrder(orderId){
    fetch(GLOBAL.BASE_URL+"orders/trackOrder/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({orderId:orderId}),
      })
    .then(res => res.json())
    .then(
     (result) => {
       if(result.status){
        let msg= {
          _id: new Date(),
          text: `Order Details \n Name 🧑:`+result.data.userName+'\n Mobile 📞: '+result.data.userMobile+'\n Address 🏡'+result.data.userAddress+'\n TotalAmount : ₹'+result.data.totalAmount+' \n Order Status: 🛵 '+result.data.orderStatus,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
          trackOrder:false
        }));
        this.showOptions();
       }
       else{
        let msg= {
          _id: new Date(),
          text: `OOpss..Soemthing went wrong...Order again 🙄`,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
       }
     })
  }

  getEmail(){
    let msg= {
      _id: new Date(),
      text: `Enter your email/mobile number 📋`,
      createdAt: new Date(),
      user: BOT_USER
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
      help:true
    }));
  }

  help(message){
    this.setState({email:message});
    let msg= {
      _id: new Date(),
      text: `Enter your query 😺`,
      createdAt: new Date(),
      user: BOT_USER
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
      help:false,
      getQuery:true
    }));
  }

  displayOk(message){
    fetch(GLOBAL.BASE_URL+"orders/query/",{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({query:message,email:this.state.email}),
      })
    .then(res => res.json())
    .then(
     (result) => {
       if(result.status){
        let msg= {
          _id: new Date()  ,
          text: `Your query has been posted ✉ we will get back to you soon `,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
          getQuery:false
        }));
        this.showOptions();
       }
       else{
        let msg= {
          _id: new Date(),
          text: `OOpss..Soemthing went wrong...Try again 🙄`,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
       }
     })
     
 
  }

  placeOrder(){
    fetch(GLOBAL.BASE_URL+"orders/placeOrder/",{
      method:"POST",
      body:JSON.stringify({totalAmount:this.state.totalAmount,userName:this.state.userName,userMobile:this.state.userMobile,userAddress:this.state.userAddress,items:cart}),
      })
    .then(res => res.json())
    .then(
     (result) => {
       if(result.status){
        let msg= {
          _id: result.orderId,
          text: `😸Cool!!!Order Placed...🍕\nYou will recieve your order soon🛵\nOrder Id: `+result.orderId,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
        let msgd= {
          _id: result.orderId+new Date(),
          text: '😸Enter your Feedback',
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msgd]),
          feedback:true
        }));
             }
       else{
        let msg= {
          _id: new Date(),
          text: `OOpss..Soemthing went wrong...Order again 🙄`,
          createdAt: new Date(),
          user: BOT_USER
        }
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
        }));
       }
     })
     
  }


  clearCart(){
    cart=[];
    this.setState({process_status:'not_started',itemSelected:'',userName:'',userAddress:'',userMobile:''});
    this.showOptions();
  }

  showOptions(){
    let msg= {
      _id: new Date()+new Date(),
      text: `Select your Need\n1 - Order Pizza 🛎\n 2 - Check Order Status 🍕\n 3 - Need help/Compliant ☎`,
      createdAt: new Date(),
      user: BOT_USER
    }
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));

  }

    selectPizza(id){
      var isExists=cart.filter((data)=>data.id===id);
      var item=this.state.pizza.filter((data)=>data.pizza_id===id)
      if(isExists.length===0){
      if(cart.length===0){  
        cart=item;
      }
      else{
        cart.push(item[0]);
      }
    }
        let msg = {
          _id: item[0].id+new Date(),
          text:'Enter the quantity for '+item[0].name+' - '+item[0].size,
          createdAt: new Date(),
          user: BOT_USER,
          image:item[0].image
        };
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, [msg]),
          itemSelected:item[0].id
        }));
    }

    setQuantity(quantity){
      if(!Number.isNaN(quantity)){
      cart.map((data)=>{
        if(data.id===this.state.itemSelected){
          data["quantity"]=quantity
        }
      })
      console.log('a',cart)
      let msg = {
        _id: new Date(),
        text:'To add more enter "Y / y"\n To view cart enter "Cart / cart"',
        createdAt: new Date(),
        user: BOT_USER
      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg]),
        itemSelected:''
      }));
    }
    else{
      this.error();
    }
    }

  error(){
    let msg = {
      _id: new Date(),
      text:'Enter the correct response 😑\n',
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  showPizza() {
    let msg = {
      _id: new Date(),
      text:'Available Pizza"s 😸\n\n Enter the pizza id to select eg:11 ',
      createdAt: new Date(),
      user: BOT_USER
    };

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
    this.state.pizza.map((data)=>{
      let msg = {
        _id: data.id+new Date(),
        text:'Pizza ID :'+data.pizza_id+'\n '+data.name+'\n Price : ₹'+data.price+'\n Size :'+data.size,
        createdAt: new Date(),
        user: BOT_USER,
        image: data.image
      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg]),
        process_status:'started'
      }));
    })
    
  }

  cartView(){
    var sum=0;
    cart.map((data,i)=>{
      sum=sum+(data.quantity*data.price);
      let msg = {
        _id: data.id+new Date(),
        text:'Pizza Id:'+data.pizza_id+'\n'+data.name+' - '+data.quantity+'\nSize: '+data.size,
        createdAt: new Date(),
        user: BOT_USER,
        image:data.image
      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg]),
        totalAmount:sum
      }));
    })
    let msgg = {
      _id:new Date()+new Date(),
      text:'TotalAmount : ₹'+sum,
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msgg]),
    }));
    let msg = {
      _id: new Date(),
      text:'To add more enter "Y / y" \n To confirm order enter "Confirm / confirm"\n To cancel order enter "X / x" ',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
  }

  checkout(){
    this.setState({process_status:"User_details"});
    this.getName();
  }

  getName(){
    let msg = {
      _id: new Date(),
      text:'Enter your name 🧑',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
      numberRecieved:false
    }));
  }

  getMobile(name){
    this.setState({userName:name});
    let msg = {
      _id: new Date(),
      text:'Enter your Number 📞',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
      numberRecieved:true,
      addressRecieved:false
    }));
  }

  getAddress(mobile){
    if(mobile.length!==10){
      let msg = {
        _id: new Date(),
        text:'Enter a valid 10 digit mobile number 😑',
        createdAt: new Date(),
        user: BOT_USER
      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg]),
        numberRecieved:true,
      addressRecieved:false
      }));
    }
    else{
    this.setState({userMobile:mobile});
    let msg = {
      _id: new Date(),
      text:'Enter your Address 🏡',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
      addressRecieved:true,
      userDetailsSummary:false
    }));
  }
  }

  userDetailsSummary(address){
    this.setState({userAddress:address},()=>{
    let msg = {
      _id: new Date().getTime(),
      text:'#User Information 📋\n\nUserName:'+this.state.userName+'\nMobile: '+this.state.userMobile+'\nAddress :'+this.state.userAddress,
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));
    this.cartDetailsSummary();
  });
  }

  cartDetailsSummary(){
    let ms = {
      _id: new Date().getTime(),
      text:'#Cart Items 📋',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [ms])
    }));
       cart.map((data,i)=>{
      let msg = {
        _id: new Date()+new Date(),
        text:'\nName:'+data.name+'\nQuantity: '+data.quantity+'\nSize:'+data.size,
        createdAt: new Date(),
        user: BOT_USER
      };
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [msg])
      }));
    })
    let msg = {
      _id:new Date(),
      text:'TotalAmount : ₹'+this.state.totalAmount,
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg]),
    }));

      let msgg = {
      _id: new Date().getMilliseconds(),
      text:'To Confirm Order enter "Confirm" \n To cancel Order enter "Cancel"\n',
      createdAt: new Date(),
      user: BOT_USER
    };
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msgg]),
      userDetailsSummary:true
    }));
  }


  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{width:'100%',backgroundColor:'#fcf876',height:60,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
          <Text style={{fontSize:25,fontWeight:'bold'}}>PizzaBot </Text>
          <Text style={{fontSize:25}}>🤖</Text>
        </View>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          placeholder='Enter you resonse'
          user={{
            _id: 1
          }}
        />
      </View>
    );
  }
}

export default App;
