import React, { useEffect, useState } from 'react';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import { Alert, Platform, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { ProductNavigationProps } from '../../@types/navigation';
import { Button } from '../../components/Button';
import { ButtonBack } from '../../components/ButtonBack';
import { Input } from '../../components/Input';
import { InputPrice } from '../../components/InputPrice';
import { Photo } from '../../components/Photo';
import { ProductProps } from '../../components/ProduciCard';

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  PickImageButton,
  Upload,
  Form,
  InputGroup,
  InputGroupHeader,
  Label,
  MaxCharacters,
} from './styles';

type PizzaResponse = ProductProps & {
  prices_sizes: {
    p: string;
    m: string;
    g: string;
  };
  photo_path: string;
};

export function Products() {
  const route = useRoute();
  const { id } = route.params as ProductNavigationProps;
  const { goBack, navigate } = useNavigation();

  const [photoPath, setPhotoPath] = useState('');
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceSizeP, setPriceSizeP] = useState('');
  const [priceSizeM, setPriceSizeM] = useState('');
  const [priceSizeG, setPriceSizeG] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlepickerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
      });

      if (!result.cancelled) {
        const { uri } = result as ImageInfo;
        setImage(uri);
      }
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      return Alert.alert('Cadastro', 'Informe o nome da pizza');
    }
    if (!description.trim()) {
      return Alert.alert('Cadastro', 'Informe a descrição da pizza');
    }
    if (!image) {
      return Alert.alert('Cadastro', 'Selecione a imagem da pizza');
    }
    if (!priceSizeP || !priceSizeM || !priceSizeG) {
      return Alert.alert(
        'Cadastro',
        'Informe o preço de todos os tamanhos da pizza',
      );
    }

    setIsLoading(true);

    const fileName = new Date().getTime();
    const reference = storage().ref(`pizzas/${fileName}.png`);

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    try {
      await firestore()
        .collection('pizzas')
        .add({
          name,
          name_insensitive: name.toLowerCase().trim(),
          description,
          prices_sizes: {
            p: priceSizeP,
            m: priceSizeM,
            g: priceSizeG,
          },
          photo_url,
          photo_path: reference.fullPath,
        });

      navigate('home');
    } catch (error) {
      Alert.alert('Cadastro', 'Não foi possível cadastrar a pizza');
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = async () => {
    try {
      const response = await firestore().collection('pizzas').doc(id).get();
      const product = response.data() as PizzaResponse;

      setName(product.name);
      setDescription(product.description);
      setImage(product.photo_url);
      setPriceSizeG(product.prices_sizes.g);
      setPriceSizeM(product.prices_sizes.m);
      setPriceSizeP(product.prices_sizes.p);
      setPhotoPath(product.photo_path);
    } catch (error) {
      Alert.alert('Consulta Pizza', 'Não foi possível realizar a consulta');
    }
  };

  const handleDelete = async () => {
    try {
      await firestore().collection('pizzas').doc(id).delete();
      await storage().ref(photoPath).delete();
    } catch (error) {
      Alert.alert('Consulta Pizza', 'Não foi possível deletar pizza');
    } finally {
      navigate('home');
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <ButtonBack onPress={goBack} />
          <Title>Cadastrar</Title>
          {id ? (
            <TouchableOpacity onPress={handleDelete}>
              <DeleteLabel>Deletar</DeleteLabel>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 20 }} />
          )}
        </Header>

        <Upload>
          <Photo uri={image} />
          {!id && (
            <PickImageButton
              title="Carregar"
              type="secondary"
              onPress={handlepickerImage}
            />
          )}
        </Upload>

        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>

          <InputGroup>
            <Label>Descrição</Label>
            <MaxCharacters>{description.length} de 60 caracteres</MaxCharacters>
            <InputGroupHeader />
            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={setDescription}
              value={description}
            />
          </InputGroup>

          <InputGroup>
            <Label>Tamanhos e preços</Label>
            <InputPrice
              size="P"
              onChangeText={setPriceSizeP}
              value={priceSizeP}
            />
            <InputPrice
              size="M"
              onChangeText={setPriceSizeM}
              value={priceSizeM}
            />
            <InputPrice
              size="G"
              onChangeText={setPriceSizeG}
              value={priceSizeG}
            />
          </InputGroup>

          {!id && (
            <Button
              isLoading={isLoading}
              title="Cadastrar Pizza"
              onPress={handleAdd}
            />
          )}
        </Form>
      </ScrollView>
    </Container>
  );
}
