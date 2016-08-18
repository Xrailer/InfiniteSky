// client file is part of InfiniteSky.
// Copyright (c) InfiniteSky Dev Teams - Licensed under GNU GPL
// For more information, see LICENCE in the main folder

/////////////////////////////////////////////////////////////
// Learn skill from skill book
// 

Zone.recv.learnSkillBook = restruct.
int32lu('unk1').
int32lu('BookItemID').
int32lu('unk3').
int32lu('ItemType').
int32lu('Rareness').
int32lu('unk6').
int32lu('unk7');

Zone.send.learnSkillBook = restruct.
int32lu('unk1').
int32lu('BookItemID').
int32lu('SkillLvl').
int32lu('ItemType').
int32lu('Rareness').
int32lu('unk6').
int32lu('unk7');

Zone.send.learnSkillBookReply = restruct.
int8lu('PacketID'). // 0x49
int8lu('Status').
int32lu('Value');

//pack to send the system infos about sucess/fail
Zone.send.replyLearnSkillBook = function replyLearnSkillBook(client, status, value) {
    client.write(
        new Buffer(
            Zone.send.learnSkillBookReply.pack({
                PacketID: 0x49,
                Status: status,
                Value: value
            })
        )
    );
}

ZonePC.Set(0x30, {
    Restruct: Zone.recv.learnSkillBook,
    function: function onRecvLearnSkillBook(client, input) {

        // TODO: Find a way to auto ban h4xors


        //Checks if the item in the inventory is the same as the one in the db
        if (client.character.Inventory[input.unk1].ID != input.BookItemID) {
            client.sendInfoMessage('h4xor');
            return;
        }

        //gets info from the Item db
        db.Item.findById(input.BookItemID, function(err, SkillBook) {
        	//gets info from the Skill db
            db.Skill.findById(SkillBook.getSkillID(), function(err, SkillName) {
            	// index its just info to know if skill is General,Supporrt or Attack
                var index = 0;
                var alreadyLearned;
                // gets the next free index in the skill book
                var freeIndex = null;
                //checks if skill book its full
                var SkillIndex;
                switch (SkillName.Category) {
                    case 2:
                        index = 20;
                        break;
                    case 3:
                    case 4:
                        index = 10;
                        break;
                }
                for (var i = index; i < (index + 10); i++) {
                    var charSkill = client.character.SkillList[i];
                    if (charSkill === null) {
                        SkillIndex = true;
                    }
                    if (charSkill && charSkill.ID === SkillName.ID) {
                        alreadyLearned = true;
                    }
                    if ((freeIndex === null && (!charSkill || !charSkill.ID))) {
                        freeIndex = i;
                    }
                }
                if (!SkillName.isUsedByClan(client.character.Clan)) {
                    client.sendInfoMessage("Skill not used by clan");
                    return Zone.send.replyLearnSkillBook(client, 1, 0);
                }
                if (SkillBook.LevelRequirement > client.character.Level) {
                    client.sendInfoMessage("Lvl to low to learn new skill");
                    return Zone.send.replyLearnSkillBook(client, 2, 0);
                }
                if (client.character.Honor < SkillBook.HonorPointReq) {
                    return Zone.send.replyLearnSkillBook(client, 3, 0);
                }
                if (alreadyLearned) {
                    client.sendInfoMessage("Already know this skill")
                    return Zone.send.replyLearnSkillBook(client, 4, 0);
                }
                if (SkillName.PointsToLearn > client.character.SkillPoints) {
                    client.sendInfoMessage("Not enough skill points to learn new skill");
                    return Zone.send.replyLearnSkillBook(client, 5, 0);
                }
                if (!SkillIndex) {
                    client.sendInfoMessage("No space in the skill Book");
                    return Zone.send.replyLearnSkillBook(client, 6, 0);
                }

                //if all the fail safes are false then it means the character can learn the skill
                Zone.send.replyLearnSkillBook(client, 7, 0);
                //learning of the skill in the correct index
                client.character.SkillList[freeIndex] = {
                    ID: SkillName.ID,
                    Level: SkillName.PointsToLearn
                };
                client.character.markModified('SkillList');
                client.character.save()
                //deletetion of the item in the db
                client.character.Inventory[input.unk1] = null;
                client.character.markModified('Inventory');
                client.character.save();
            });
        });
    }
});




























/* db.Skill.findById(input.ItemID, function(err, skill){*/


/* if(err){
   console.log("Error on finding skills")
   Zone.send.itemAction.call(self, 1, input);
   return;
 }

 if(!skill){
   console.log("Skill not found")
   Zone.send.itemAction.call(self, 1, input);
   return;
 }

 if(!skill.isUsedByClan(self.character.Clan)){
   console.log("Skill not used by clan");
   Zone.send.itemAction.call(self, 1, input);
   return;
 }

 

 var index = 0;
 var alreadyLearned;
 var freeIndex = null;

 switch(skill.Category){
   case 2:
   index = 20;
   break;

   case 3:
   case 4:
   index = 10;
   break;
 }

 for(var i=index; i<(index+10); i++){
   var charSkill = self.character.SkillList[i];
   if(charSkill && charSkill.ID === input.ItemID){
     alreadyLearned = true;
     break;
   }

   if(freeIndex === null && (!charSkill || !charSkill.ID)){
     freeIndex = i;
   }
 }


 if(!freeIndex){
   console.log("Next free index could not be found");
   Zone.send.itemAction.call(self, 1, input);
   return;
 }

 if(alreadyLearned){
   console.log("Already know client skill")
   Zone.send.itemAction.call(self, 1, input);
   return;
 }

 self.character.SkillPoints -= skill.PointsToLearn;

 self.character.SkillList[freeIndex] = {
   ID: input.ItemID,
   Level: skill.PointsToLearn
 };

 self.character.markModified('SkillList');
 self.character.save(function(err){
   if(err){
     Zone.send.itemAction.call(self, 1, input);
     return;
   }

   Zone.send.itemAction.call(self, 0, input);
 });*/
/*});*/


















/* db.Skill.findById(input.SkillID, function(err, skill){
			if(err){
				console.log('Error occoured on finding skill', input.SkillID, 'for', client.character.Name);
				return;
			}*/


/*
	client.character.Ring = { ID: 9624, Enchant: 0, Combine: 0 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Cape = { ID: 99344, Enchant: 0, Combine: 0 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Outfit = { ID: 9620, Enchant: 40, Combine: 12 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Gloves = { ID: 9622, Enchant: 40, Combine: 12 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Amulet = { ID: 9623, Enchant: 0, Combine: 0 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Boots = { ID: 9621, Enchant: 40, Combine: 12 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.CalbashBottle = { ID: Value, Enchant: Value2, Combine: Value3 };
	client.character.save();
	sendCharUpdate = true;
			
	client.character.Weapon = { ID: 9618, Enchant: 40, Combine: 12 };
	client.character.save();*/