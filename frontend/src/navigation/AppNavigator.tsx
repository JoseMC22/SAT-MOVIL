import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MenuScreen from '../screens/MenuScreen';
import DebtInquiryScreen from '../screens/DebtInquiryScreen';
import MessageBoxScreen from '../screens/MessageBoxScreen';
import MessageDetailScreen from '../screens/MessageDetailScreen';
import StatusTramiteScreen from '../screens/StatusTramiteScreen';
import ContactScreen from '../screens/ContactScreen';
import DebtResultsScreen from '../screens/DebtResultsScreen';
import PapeletaInquiryScreen from '../screens/PapeletaInquiryScreen';
import PapeletaResultsScreen from '../screens/PapeletaResultsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

export function AppNavigator({ onReady }: { onReady: () => void }) {
    return (
        <NavigationContainer onReady={onReady}>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTintColor: theme.colors.white,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Menu"
                    component={MenuScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="DebtInquiry"
                    component={DebtInquiryScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Mailbox"
                    component={MessageBoxScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MessageDetail"
                    component={MessageDetailScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="TramiteStatus"
                    component={StatusTramiteScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Contact"
                    component={ContactScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="DebtResults"
                    component={DebtResultsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PapeletaInquiry"
                    component={PapeletaInquiryScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PapeletaResults"
                    component={PapeletaResultsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ChangePassword"
                    component={ChangePasswordScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="TermsAndConditions"
                    component={TermsAndConditionsScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
