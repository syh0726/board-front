<template>
  <div class="Setting">
    <el-form>
      <el-form-item label="이메일">
        <el-input v-model="SettingMember.email" disabled></el-input>
      </el-form-item>
    </el-form>

    <el-form>
      <el-form-item label="닉네임">
        <el-input v-model="SettingMember.nickName"></el-input>
        <el-button type="primary" @click="onChangeNickname">닉네임 변경</el-button>
      </el-form-item>
    </el-form>

    <el-form>
      <el-form-item label="휴대폰">
        <el-input v-model="SettingMember.phoneNumber"></el-input>
        <el-button type="primary" @click="onChangePhone">휴대폰 변경</el-button>
      </el-form-item>
    </el-form>


  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
  import axios from "axios";
import type { FieldError } from '@/custom-types/fieldError'
import axiosInstance from '@/api/axios'

  const SettingMember =ref({
    email:'',
    nickName:'',
    phoneNumber:''
});


  onMounted(async ()=>{
    const response=await axiosInstance.get("/auth/profile",{
      withCredentials:true
    });

    SettingMember.value=response.data;
  })

  const onChangeNickname=async function (){
      try{
        await axiosInstance.put("/auth/setting/nickname",SettingMember.value.nickName,{
        withCredentials:true,
          headers:{
            'Content-Type':'application/json',
          },
        })
        alert("닉네임 변경 성공!");
      }catch (error:any){
        if(error.response) {
          const errorData = error.response.data;
          alert(`닉네임 변경 실패: ${errorData.message}`);
          if (errorData.errors.length > 0) {
            errorData.errors.forEach((fieldError: FieldError) => {
              alert(`${fieldError.field}: ${fieldError.reason}`)
            });
          }
        }
      }

  }

const onChangePhone=async function (){
  try{
    await axiosInstance.put("/auth/setting/phone",SettingMember.value.phoneNumber,{
      withCredentials:true,
      headers:{
        'Content-Type':'application/json',
      },
    })
    alert("휴대폰 번호 변경 성공!");
  }catch (error:any){
    if(error.response) {
      const errorData = error.response.data;
      alert(`휴대폰 번호 변경 실패: ${errorData.message}`);
      if (errorData.errors.length > 0) {
        errorData.errors.forEach((fieldError: FieldError) => {
          alert(`${fieldError.field}: ${fieldError.reason}`)
        });
      }
    }
  }

}


</script>

<style scoped>
.Setting{
  margin-left: 50px;
}

.Setting .el-input{
  width: 200px;
}
</style>