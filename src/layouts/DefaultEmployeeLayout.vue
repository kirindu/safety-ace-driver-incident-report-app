<script setup>

import { RouterLink, RouterView } from 'vue-router'

import NavHeader from '@/components/NavHeader.vue'
import Header from '@/components/Header.vue'
import SideBar from '@/components/SideBar.vue'
import Footer from '@/components/Footer.vue'


</script>

<template>

<div id="main-wrapper">
    <NavHeader />
    <Header />
    <!-- <SideBar /> -->
</div>
<RouterView />






</template>



