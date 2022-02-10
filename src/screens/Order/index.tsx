import React, { useState, useEffect } from 'react';

import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';

import { OrderNavigationProps } from '../../@types/navigation';
import { Button } from '../../components/Button';
import { ButtonBack } from '../../components/ButtonBack';
import { Input } from '../../components/Input';
import { ProductProps } from '../../components/ProduciCard';
import { RadioButton } from '../../components/RadioButton';
import { useAuth } from '../../hooks/auth';
import { PIZZA_TYPES } from '../../utils/pizzaTypes';

import {
  Container,
  Header,
  Photo,
  Sizes,
  Form,
  FormRow,
  InputGroup,
  Label,
  Price,
  Title,
  ContentScroll,
} from './styles';

type PizzaResponse = ProductProps & {
  prices_sizes: {
    [key: string]: number;
  };
};

export function Order() {
  const { goBack, navigate } = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [tableNumber, setTableNumber] = useState('');
  const [pizza, setPizza] = useState<PizzaResponse>();
  const [sendingOrder, setSendingOrder] = useState(false);

  const { id } = route.params as OrderNavigationProps;

  const amount = size ? pizza.prices_sizes[size] * quantity : '0,00';

  const handleOrder = async () => {
    if (!size) {
      return Alert.alert('Pedido', 'Selecione o tamanho da pizza');
    }

    if (!quantity) {
      return Alert.alert('Pedido', 'Informe a quantidade');
    }

    if (!tableNumber) {
      return Alert.alert('Pedido', 'Informe o número da mesa');
    }

    setSendingOrder(true);

    try {
      await firestore().collection('orders').add({
        quantity,
        amount,
        pizza: pizza.name,
        size,
        table_number: tableNumber,
        status: 'Preparando',
        waiter_id: user?.id,
        image: pizza.photo_url,
      });

      navigate('home');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      Alert.alert('Pedido', 'Não foi possível realizar o pedido');
    } finally {
      setSendingOrder(false);
    }
  };

  const getProduct = async () => {
    try {
      const response = await firestore().collection('pizzas').doc(id).get();
      setPizza(response.data() as PizzaResponse);
    } catch (error) {
      Alert.alert('Pedido', 'Não foi possível carregar o produto');
    }
  };

  useEffect(() => {
    if (id) {
      getProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ContentScroll>
        <Header>
          <ButtonBack onPress={() => goBack()} style={{ marginBottom: 108 }} />
        </Header>
        <Photo source={{ uri: pizza?.photo_url }} />

        <Form>
          <Title>{pizza?.name}</Title>

          <Label>Selecione um tamanho</Label>
          <Sizes>
            {PIZZA_TYPES.map((type) => (
              <RadioButton
                key={type.id}
                title={type.name}
                onPress={() => setSize(type.id)}
                selected={size === type.id}
              />
            ))}
          </Sizes>

          <FormRow>
            <InputGroup>
              <Label>Número da mesa</Label>
              <Input keyboardType="numeric" onChangeText={setTableNumber} />
            </InputGroup>
            <InputGroup>
              <Label>Quantidade</Label>
              <Input
                keyboardType="numeric"
                onChangeText={(value) => setQuantity(Number(value))}
              />
            </InputGroup>
          </FormRow>

          <Price>Valor de R$ {amount}</Price>
          <Button
            title="Confirmar pedido"
            onPress={handleOrder}
            isLoading={sendingOrder}
          />
        </Form>
      </ContentScroll>
    </Container>
  );
}
