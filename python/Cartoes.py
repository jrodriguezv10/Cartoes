# !/usr/bin/python
import os
import time
import json
import re
from tabulate import tabulate
from dateutil import parser

from pip._vendor import requests


class EntradaCartao(object):
    codLinha = ""
    codVeiculo = ""
    dataNascimentoUsuario = ""
    dataEntrada = ""
    nomeLinha = ""
    numeroCartao = ""
    sexoUsuario = ""

    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
                          sort_keys=True, indent=4)

    # "CODLINHA": "619",
    # "CODVEICULO": "HA291",
    # "DATANASCIMENTO": "17/06/87",
    # "DATAUTILIZACAO": "09/04/17 18:52:49,000000",
    # "NOMELINHA": "STA. RITA / CIC",
    # "NUMEROCARTAO": "0003721563",
    # "SEXO": "F"

def make_entrada_cartao(codLinha, codVeiculo, dataNascimentoUsuario, dataEntrada, nomeLinha, numeroCartao, sexoUsuario):
    entrada = EntradaCartao()
    entrada.codLinha = codLinha
    entrada.codVeiculo = codVeiculo
    entrada.dataNascimentoUsuario = dataNascimentoUsuario
    entrada.dataEntrada = dataEntrada
    entrada.nomeLinha = nomeLinha
    entrada.numeroCartao = numeroCartao
    entrada.sexoUsuario = sexoUsuario
    return entrada

def load_from_web():
    dir_path_root = os.path.dirname(os.path.realpath(__file__)) +"/convenios/"
    if not os.path.exists(dir_path_root):
        os.makedirs(dir_path_root)

    now = time.strftime("%c")
    print("Current date " + time.strftime("%x"))

    base_url = 'http://transporteservico.urbs.curitiba.pr.gov.br/convenios/?h=44de3&v=db9b2'


    r = requests.get(base_url)
    cartoes = r.text
    sub = "}\n{"
    cartoes = re.sub(sub, '},\n{', cartoes)

    jsonStringCartoes = '[' + cartoes + ']'

    jsonCartoes = json.loads(jsonStringCartoes)
    # print(jsonCartoes)

    filename = now+".json"
    fp = open(dir_path_root + filename, 'w')
    json.dump(jsonCartoes, fp, indent=4,sort_keys=True,ensure_ascii=False)
    print("Arquivo " + filename + " salvo!")
    return jsonCartoes

def load_offline_test():
    dir_path_root = os.path.dirname(os.path.realpath(__file__)) +"/convenios/"
    if not os.path.exists(dir_path_root):
        os.makedirs(dir_path_root)

    json_data = open(dir_path_root + "offline.json").read()

    jsonCartoes = json.loads(json_data)

    return jsonCartoes

def list_different_bus_line_codes(entradas):
    diffs = []
    for entrada in entradas:
        if entrada.codLinha not in diffs:
            diffs.append(entrada.codLinha)

    diffs.sort()
    print("Códigos de linhas diferentes (count=" + str(len(diffs)) + "):")
    print(", ".join(diffs))

def main():


    # "CODLINHA": "619",
    # "CODVEICULO": "HA291",
    # "DATANASCIMENTO": "17/06/87",
    # "DATAUTILIZACAO": "09/04/17 18:52:49,000000",
    # "NOMELINHA": "STA. RITA / CIC",
    # "NUMEROCARTAO": "0003721563",
    # "SEXO": "F"

    entradas = []
    jsonData = load_offline_test()


    countTotal = 0
    countValidas = 0
    for entradaJSON in jsonData:
        countTotal += 1
        newEntradaObject = make_entrada_cartao(entradaJSON['CODLINHA'], entradaJSON['CODVEICULO'], entradaJSON['DATANASCIMENTO'], entradaJSON['DATAUTILIZACAO'], entradaJSON['NOMELINHA'], entradaJSON['NUMEROCARTAO'], entradaJSON['SEXO'])

        if(newEntradaObject.codLinha!="000"):
            entradas.append(newEntradaObject)
            countValidas += 1

    list_different_bus_line_codes(entradas)

    entradas = sorted(entradas, key=lambda x: x.dataEntrada, reverse=False)
    recorrencias = []

    dontRepeat = []
    for entradaA in entradas[:10]:
        #print(entradaA.dataEntrada)
        #"09/04/17 00:35:49,000000" 'Jun 1 2005  1:33PM'
        dataEntradaA = parser.parse(entradaA.dataEntrada)
        for entradaB in entradas[:10]:

            # Considerar somente diferenças positivas no tempo cortam recorrencias duplicadas, pois sempre haverá um par inverso
            if entradaA.numeroCartao == entradaB.numeroCartao and entradaA.dataEntrada != entradaB.dataEntrada:

                dataEntradaB = parser.parse(entradaB.dataEntrada)
                diff = dataEntradaB - dataEntradaA
                diff = diff.total_seconds()

                if (diff>0):
                    recorrencias.append([entradaA.numeroCartao,entradaA.codLinha, entradaA.dataEntrada, entradaB.dataEntrada, entradaA.codLinha, entradaB.codLinha, diff])

    print(tabulate(recorrencias, headers=['Número Cartão', 'Cod. Linha Onibus', 'Data entrada A', 'Data entrada B','Cod. Linha A', 'Cod. Linha B', 'Diff Seconds']))
    print("Count total:"  + str(countTotal))
    print("Count Validas:"  + str(countValidas))
    print("Count Recorrencias:"  + str(len(recorrencias)))


if __name__ == '__main__':
   main()
