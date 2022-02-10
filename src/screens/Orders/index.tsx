import React, { useCallback, useEffect, useState } from 'react';

import firestore from '@react-native-firebase/firestore';
import { Alert, FlatList } from 'react-native';

import { ItemSeparator } from '../../components/ItemSeparator';
import { OrderCard, OrderProps } from '../../components/OrderCard';
import { useAuth } from '../../hooks/auth';

import { Container, Header, Title } from './styles';

export function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderProps[]>([]);

  const separator = useCallback(() => {
    return <ItemSeparator />;
  }, []);

  const getOrders = useCallback(async () => {
    const subscribe = firestore()
      .collection('orders')
      .where('waiter_id', '==', user?.id)
      .onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        }) as OrderProps[];
        setOrders(data);
      });

    return () => subscribe();
  }, [user?.id]);

  const handlePizzaDelivered = (id: string) => {
    Alert.alert('Pedido', 'Confirma que a pizza foi entregue?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: async () => {
          try {
            await firestore().collection('orders').doc(id).update({
              status: 'Entregue',
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
            Alert.alert(
              'Pedido',
              'Ocorreu um erro ao mudar status do pedido para entregue, tente novamente',
            );
          }
        },
      },
    ]);
  };

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <Container>
      <Header>
        <Title>Pedidos feitos</Title>
      </Header>

      <FlatList
        data={orders}
        keyExtractor={(item) => item?.id}
        renderItem={({ item, index }) => (
          <OrderCard
            data={item}
            index={index}
            disabled={item.status === 'Entregue'}
            onPress={() => handlePizzaDelivered(item.id)}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 125 }}
        ItemSeparatorComponent={separator}
      />
    </Container>
  );
}
