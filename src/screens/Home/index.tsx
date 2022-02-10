import React, { useState, useCallback } from 'react';

import { MaterialIcons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native';

import happyEmoji from '../../assets/happy.png';
import { ProduciCard, ProductProps } from '../../components/ProduciCard';
import { Search } from '../../components/Search';
import { useAuth } from '../../hooks/auth';

import {
  Container,
  Header,
  Greeting,
  GreetingEmoji,
  GreetingText,
  MenuHeader,
  MenuItemsNumber,
  Title,
  NewProductButton,
} from './styles';

export function Home() {
  const { signOut, user } = useAuth();
  const { COLORS } = useTheme();
  const { navigate } = useNavigation();

  const [pizzas, setPizzas] = useState<ProductProps[]>([]);
  const [search, setSearch] = useState('');

  const fetchPizzas = async (value: string) => {
    const formattedValue = value.toLocaleLowerCase().trim();

    try {
      const response = await firestore()
        .collection('pizzas')
        .orderBy('name_insensitive')
        .startAt(formattedValue)
        .endAt(`${formattedValue}\uf8ff`)
        .get();

      const data = response.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as ProductProps[];

      setPizzas(data);
    } catch (error) {
      Alert.alert('Home', 'Não foi possível realizar a consulta');
    }
  };

  const handleSearch = () => {
    fetchPizzas(search);
  };

  const handleSearchClear = () => {
    setSearch('');
  };

  const handleOpen = (id: string) => {
    const route = user?.isAdmin ? 'product' : 'order';
    navigate(route, { id });
  };
  const handleAdd = () => {
    navigate('product', {});
  };

  useFocusEffect(
    useCallback(() => {
      fetchPizzas(search);
    }, [search]),
  );

  return (
    <Container>
      <Header>
        <Greeting>
          <GreetingEmoji source={happyEmoji} />
          <GreetingText>Olá, {user.name}</GreetingText>
        </Greeting>
        <TouchableOpacity onPress={signOut}>
          <MaterialIcons name="logout" color={COLORS.TITLE} size={24} />
        </TouchableOpacity>
      </Header>

      <Search
        onChangeText={setSearch}
        value={search}
        onClear={handleSearchClear}
        onSearch={handleSearch}
      />
      <MenuHeader>
        <Title>Cardápio</Title>
        <MenuItemsNumber>{pizzas.length} pizzas</MenuItemsNumber>
      </MenuHeader>

      <FlatList
        data={pizzas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProduciCard data={item} onPress={() => handleOpen(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 125,
          marginHorizontal: 24,
        }}
      />

      {user?.isAdmin && (
        <NewProductButton
          title="Cadastrar Pizza"
          type="secondary"
          onPress={handleAdd}
        />
      )}
    </Container>
  );
}
