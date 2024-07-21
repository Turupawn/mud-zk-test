pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template commitmentHasher() {
    signal input a;
    signal input b;
    signal input c;
    signal output commitment;
    component poseidonComponent;
    poseidonComponent = Poseidon(3);
    poseidonComponent.inputs[0] <== a;
    poseidonComponent.inputs[1] <== b;
    poseidonComponent.inputs[2] <== c;
    commitment <== poseidonComponent.out;
}

template proveWrong() {
    signal input a;
    signal input b;
    signal input c;
    signal input guess;
    signal output commitment;
    signal output result;

    component commitmentHasherComponent;
    commitmentHasherComponent = commitmentHasher();
    commitmentHasherComponent.a <== a;
    commitmentHasherComponent.b <== b;
    commitmentHasherComponent.c <== c;
    commitment <== commitmentHasherComponent.commitment;

    signal check_a;
    signal check_b;
    signal check_c;
    signal agregationTemp;
    signal agregationFinal;

    check_a <== a - guess;
    check_b <== b - guess;
    check_c <== c - guess;

    agregationTemp <== check_a * check_b;
    agregationFinal <== agregationTemp * check_c;
    component isz = IsZero();
    agregationFinal ==> isz.in;

    isz.out ==> result;

    log(result);
    log(commitment);
}

component main {public [guess]} = proveWrong();
