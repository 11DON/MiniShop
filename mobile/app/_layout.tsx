import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function RootLayout() {
    const {loadUser} = useAuthStore()

    useEffect(()=> {
        loadUser()
    },[])

    return(
        <Stack screenOptions={{headerShown:false}}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="order/[id]" />
        </Stack>
    )
}