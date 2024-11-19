import { StatusBar } from "react-native";

import Routes from "./routes";

import AuthProvider from "./contexts/AuthContext";

export default function App() {
    return (
        <>
            <AuthProvider>
                <StatusBar backgroundColor={'#1d1d2e'} barStyle="light-content" translucent={false} />
                <Routes />
            </AuthProvider>
        </>
    )
}