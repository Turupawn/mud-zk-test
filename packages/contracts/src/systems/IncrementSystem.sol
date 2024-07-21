// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter, SecretCommitment } from "../codegen/index.sol";

interface ICircomVerifier {
    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[3] calldata _pubSignals) external view returns (bool);
}

contract IncrementSystem is System {
  function increment(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[3] calldata _pubSignals) public returns (uint32) {
    ICircomVerifier(0x9A676e781A523b5d0C0e43731313A708CB607508).verifyProof(_pA, _pB, _pC, _pubSignals);
    uint32 commitment = uint32(_pubSignals[0]);
    uint32 result = uint32(_pubSignals[1]);
    uint32 guess = uint32(_pubSignals[2]);

    require(result == 1, "Invalid resultt");
    
    uint32 secretCommitment = SecretCommitment.get();
    require(uint32(uint(commitment)) == secretCommitment, "Invalid commitment");

    uint32 counter = Counter.get();
    uint32 newValue = counter + 1;
    Counter.set(newValue);
    return newValue;
  }
}
