import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  Container,
  Name,
  Description,
  Stats,
  Stat,
  StatCount,
  Refresh,
  RefreshText,
  ButtonsGroup,
} from './styles';

export default function Repository({ data, onRefresh, onDestroy }) {
  return (
    <Container>
      <Name>{data.name}</Name>
      <Description>{data.description}</Description>
      <Stats>
        <Stat>
          <Icon name="star" size={16} color="#333" />
          <StatCount>{data.stars}</StatCount>
        </Stat>
        <Stat>
          <Icon name="code-fork" size={16} color="#333" />
          <StatCount>{data.forks}</StatCount>
        </Stat>
      </Stats>

      <ButtonsGroup>
        <Refresh onPress={onRefresh}>
          <Icon name="refresh" color="#7159c1" size={16} />
          <RefreshText>Atualizar</RefreshText>
        </Refresh>
        <Refresh onPress={onDestroy}>
          <Icon name="trash" color="#7159c1" size={16} />
          <RefreshText>Remover</RefreshText>
        </Refresh>
      </ButtonsGroup>
    </Container>
  );
}
