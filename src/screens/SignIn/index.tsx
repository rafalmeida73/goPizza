import React, { useState } from 'react';

import { KeyboardAvoidingView, Platform } from 'react-native';

import brandImg from '../../assets/brand.png';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/auth';

import {
  Container,
  Content,
  Title,
  Brand,
  ForgotPasswordButton,
  ForgotPasswordLabel,
} from './styles';

export function SignIn() {
  const { isLogging, signIn, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSingIn() {
    signIn(email, password);
  }

  function handleForgotPassword() {
    forgotPassword(email);
  }

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Content>
          <Brand source={brandImg} />
          <Title>Login</Title>
          <Input
            placeholder="E-mail"
            type="secondary"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Senha"
            type="secondary"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            onChangeText={setPassword}
          />

          <ForgotPasswordButton onPress={() => handleForgotPassword()}>
            <ForgotPasswordLabel>Esqueci minha senha</ForgotPasswordLabel>
          </ForgotPasswordButton>

          <Button
            title="Entrar"
            type="secondary"
            onPress={() => handleSingIn()}
            isLoading={isLogging}
          />
        </Content>
      </KeyboardAvoidingView>
    </Container>
  );
}
