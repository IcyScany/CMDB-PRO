<script setup>
import  {useRouter} from 'vue-router';


const props = defineProps({
    next: {
        type: String,
        default: '',
    },
});
const { next } = toRefs(props);
let router = useRouter();


onMounted(() => {

});

const loginSuccess = () =>{
    if (next.value) {
        router.push({ path: next.value});
    } else {
        
        router.push({ name: 'homePage'});
    }
};

</script>

<template>
    <div class="section-shaped">
        <div class="logo ml-2 mt-2">
            <img src="/src/assets/images/OpsCenter_logo.png" alt="logo" height="40"/>
        </div>
        <div class="login-container">
           <a-row type="flex" :wrap="false" justify="center">
               <a-col flex="100%"> <CmdbLoginForm  class="right-wrap" @login-success="loginSuccess"/></a-col>
           </a-row>
        </div>
    </div>
</template>

<style lang="less" scoped>

.bg-gradient-red {
    background: linear-gradient(87deg, #f5365c, #f56036) !important;
}
.section-shaped{
    transform-origin: center center;
    height: 100%;

    background-size: cover;
    background-attachment: fixed;
    background-color: #dce8fd;
    background-image: url("/src/assets/images/login/bg7.png");
    background-position: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-width: 1280px;

    .login-container {

        align-items: center;
        display: flex;
        flex: 1 1 auto;
        justify-content: center;

    }
    & .shape {
        position: fixed;
        top: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        & span {
            position: absolute;
            height: 120px;
            width: 120px;
            border-radius: 50%;
        }
        & :first-child {
            left: -4%;
            bottom: auto;
            background: hsla(0,0%,100%,.1)
        }
        & :nth-child(2) {
            right: 4%;
            top: 10%;
            background: hsla(0,0%,100%,.1)
        }
        & :nth-child(3) {
            top: 280px;
            right: 5.66666%;
            background: hsla(0,0%,100%,.3)
        }

        & :nth-child(4) {
            top: 320px;
            right: 7%;
            background: hsla(0,0%,100%,.15)
        }

        & :nth-child(5) {
            top: 38%;
            left: 1%;
            right: auto;
            background: hsla(0,0%,100%,.05)
        }

        & :nth-child(6) {
            width: 200px;
            height: 200px;
            top: 44%;
            left: 10%;
            right: auto;
            background: hsla(0,0%,100%,.15)
        }

        & :nth-child(7) {
            bottom: 50%;
            right: 36%;
            background: hsla(0,0%,100%,.04)
        }

        & :nth-child(8) {
            bottom: 70px;
            right: 2%;
            background: hsla(0,0%,100%,.2)
        }

        & :nth-child(9) {
            bottom: 1%;
            right: 2%;
            background: hsla(0,0%,100%,.1)
        }

        & :nth-child(10) {
            bottom: 1%;
            left: 1%;
            right: auto;
            background: hsla(0,0%,100%,.05)
        }
    }
    .right_wrap {
        align-items: center;
        background: #fff;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        min-height: 600px;
        min-width: 600px;
        padding: 50px 0 0;
        position: relative;
    }
}







</style>
