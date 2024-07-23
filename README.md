# Minimal ZK demo game with MUD

![Screenshot from 2024-07-20 23-34-42](https://github.com/user-attachments/assets/54d4a163-3c2b-4c9c-95a4-fd4804d04b18)

* Using MUD vanilla template
* Circom circuits, snarkjs prover, libcircomjs poseidon hash
* "Guess one of three numbers" game. PvE Scenario
* The game creator (game master) hashes 3 secret numbers and post them to a SecretCommitment MUD Singleton
* Players can submit a number to a theoretical backend (currently done locally) then the backend can prove the result (fail or success guess)
* If the are correct, they can submit the proof on-chain and increment a Counter MUD Singleton
* This can serve, for example for hidden treasures in a map that players can look for, also other cases
* I can see see this play out in PvP scenarios

## Important files

* [Circuit](https://github.com/Turupawn/mud-zk-test/blob/master/circuits/proveWrong.circom)
* [snarkjs proving](https://github.com/Turupawn/mud-zk-test/blob/master/packages/client/src/mud/createSystemCalls.ts#L39)
* [contract verification](https://github.com/Turupawn/mud-zk-test/blob/master/packages/contracts/src/systems/IncrementSystem.sol#L13)

## Deploy guide

### 1. Compile and generate artifacts
```bash
cd circuits
circom proveWrong.circom --r1cs --wasm --sym
node proveWrong_js/generate_witness.js proveWrong_js/proveWrong.wasm input.json witness.wtns
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup proveWrong.r1cs pot12_final.ptau proveWrong_0000.zkey
snarkjs zkey contribute proveWrong_0000.zkey proveWrong_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey proveWrong_0001.zkey verification_key.json
snarkjs zkey export solidityverifier proveWrong_0001.zkey verifier.sol
```

#### 2. Deploy the solidity verifier
```bash
forge create --rpc-url http://127.0.0.1:8545  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 verifier.sol:Groth16Verifier
```

### 3. Customize your deploy

Start by running the chain

```bash
pnpm dev start
```

Now place the contract address in `packages/contracts/src/systems/IncrementSystem.sol` at:

```
ICircomVerifier(0x9A676e781A523b5d0C0e43731313A708CB607508).verifyProof(_pA, _pB, _pC, _pubSignals);
```

Also customize `packages/contracts/script/PostDeploy.s.sol` to add your Poseidon commitment:

```bash
SecretCommitment.set(uint32(uint(6542985608222806190361240322586112750744169038454362455181422643027100751666)));
```

### 4. Copy your artifacts

```bash
mkdir ../packages/client/src/zk_artifacts
cp proveWrong_js/proveWrong.wasm ../packages/client/src/zk_artifacts/
cp proveWrong_0001.zkey ../packages/client/src/zk_artifacts/proveWrong_final.zkey
cp verification_key.json ../packages/client/src/zk_artifacts/
```

Now you should be ready to submit proofs on the frontend.
